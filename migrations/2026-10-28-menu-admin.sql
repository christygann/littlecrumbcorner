-- ─────────────────────────────────────────────────────────────
-- Migration: menu managed from the admin (2026-10-28)
--
-- Run ONCE on an existing database that was set up with the earlier
-- setup.sql: supabase.com → your project → SQL Editor → New query → Run.
-- (A brand-new project only needs setup.sql, which already includes this.)
--
-- Moves the menu (names, labels, descriptions, photos, sizes) into the
-- database, adds sold out / unavailable / hidden statuses, and adds a
-- public bucket for menu photos. Safe to run while the current site is live.
-- ─────────────────────────────────────────────────────────────

BEGIN;

-- 1. Menu items
CREATE TABLE public.menu_items (
  id         text        PRIMARY KEY,
  name       text        NOT NULL,
  tag        text,
  blurb      text,
  photo_url  text,
  status     text        NOT NULL DEFAULT 'available'
             CHECK (status IN ('available', 'sold_out', 'unavailable', 'hidden')),
  sort       integer     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.menu_items (id, name, tag, blurb, photo_url, status, sort) VALUES
  ('basque',     'basque burnt cheesecake', 'baker''s favourite', 'Slow-baked, caramelised top with a soft, almost-set centre.',      '/basque-cheesecake.png',     'available',   10),
  ('brownie',    'double fudge brownie',    'signature',          'Dense, fudgy, crackled top — dark chocolate folded through.',      '/double-fudge-brownie.png',  'available',   20),
  ('strawberry', 'strawberry shortcake',    NULL,                 'Light vanilla sponge layered with cream and fresh strawberries.', '/strawberry-shortcake.png',  'unavailable', 30),
  ('muffin',     'apple cinnamon muffin',   NULL,                 'Warm spiced apple folded with soft, tender crumb topping.',       '/apple-cinnamon-muffin.png', 'unavailable', 40);

ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public_read" ON public.menu_items FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_write" ON public.menu_items FOR ALL    TO authenticated        USING (true) WITH CHECK (true);

-- 2. Sizes: link each product to its item and give it a status
ALTER TABLE public.online_products
  ADD COLUMN item_id text REFERENCES public.menu_items(id) ON DELETE CASCADE,
  ADD COLUMN option  text NOT NULL DEFAULT '',
  ADD COLUMN unit    text,
  ADD COLUMN status  text NOT NULL DEFAULT 'available'
                     CHECK (status IN ('available', 'sold_out', 'hidden'));

-- the current menu (also applies the latest brownie sizes and prices)
INSERT INTO public.online_products (id, item_id, option, unit, name, price, status, sort) VALUES
  ('basque',       'basque',     'slice',                 'per slice',  'basque burnt cheesecake (slice)',              5.50, 'available', 10),
  ('basque-whole', 'basque',     'whole cake · 8"',       'whole cake', 'basque burnt cheesecake (whole 8")',          50.00, 'available', 11),
  ('brownie',      'brownie',    'large slice',           'per slice',  'double fudge brownie (large slice)',           5.00, 'available', 20),
  ('brownie-7',    'brownie',    'box of 9 · 7" × 7"',    'box of 9',   'double fudge brownie (box of 9, 7" × 7")',    35.00, 'available', 21),
  ('brownie-10',   'brownie',    'box of 16 · 10" × 10"', 'box of 16',  'double fudge brownie (box of 16, 10" × 10")', 55.00, 'available', 22),
  ('strawberry',   'strawberry', 'slice',                 'per slice',  'strawberry shortcake',                         5.00, 'available', 30),
  ('muffin',       'muffin',     'each',                  'each',       'apple cinnamon muffin',                        4.00, 'available', 40)
ON CONFLICT (id) DO UPDATE SET
  item_id = EXCLUDED.item_id, option = EXCLUDED.option, unit = EXCLUDED.unit, name = EXCLUDED.name,
  price = EXCLUDED.price, status = EXCLUDED.status, sort = EXCLUDED.sort;

-- any older sizes (e.g. a brownie box of 6) are kept but hidden
UPDATE public.online_products SET
  item_id = CASE WHEN id LIKE 'brownie%' THEN 'brownie' WHEN id LIKE 'basque%' THEN 'basque' END,
  option  = name,
  status  = 'hidden'
WHERE item_id IS NULL;
DELETE FROM public.online_products WHERE item_id IS NULL;

ALTER TABLE public.online_products ALTER COLUMN item_id SET NOT NULL;
CREATE INDEX online_products_item_idx ON public.online_products (item_id);

-- "available" now follows status (kept so the currently deployed site keeps working)
ALTER TABLE public.online_products DROP COLUMN available;
ALTER TABLE public.online_products
  ADD COLUMN available boolean GENERATED ALWAYS AS (status = 'available') STORED;

-- 3. Orders check the item's and the size's status
-- Places an order. Prices come from online_products, never from the browser,
-- and every fulfilment rule the checkout enforces is re-checked here.
CREATE OR REPLACE FUNCTION public.place_online_order(p jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_method   text := p->>'method';
  v_date     date;
  v_slot     text := p->>'slot';
  v_name     text := btrim(coalesce(p->>'name', ''));
  v_phone    text := btrim(coalesce(p->>'phone', ''));
  v_street   text := btrim(coalesce(p->>'street', ''));
  v_unit     text := btrim(coalesce(p->>'unit', ''));
  v_postal   text := btrim(coalesce(p->>'postal', ''));
  v_proof    text := p->>'proofPath';
  v_today    date := (now() AT TIME ZONE 'Asia/Singapore')::date;
  v_items    jsonb := '[]'::jsonb;
  v_subtotal numeric(10,2) := 0;
  v_fee      numeric(10,2);
  v_number   text;
  v_row      public.online_orders;
  r          record;
BEGIN
  -- fulfilment
  IF v_method NOT IN ('collect', 'deliver') THEN
    RAISE EXCEPTION 'Choose collection or delivery.';
  END IF;

  BEGIN
    v_date := (p->>'date')::date;
  EXCEPTION WHEN others THEN
    RAISE EXCEPTION 'Pick a date.';
  END;
  IF v_date IS NULL OR v_date < v_today + 2 OR v_date > v_today + 60 THEN
    RAISE EXCEPTION 'Pick a date at least two days from today.';
  END IF;

  IF v_method = 'collect' THEN
    -- Saturday 6pm or Sunday 12pm
    IF NOT ((extract(dow FROM v_date) = 6 AND v_slot = '6:00pm')
         OR (extract(dow FROM v_date) = 0 AND v_slot = '12:00pm')) THEN
      RAISE EXCEPTION 'Pick a collection day.';
    END IF;
    v_fee := 0;
  ELSE
    IF extract(dow FROM v_date) = 1 THEN
      RAISE EXCEPTION 'We don''t deliver on Mondays.';
    END IF;
    IF v_slot NOT IN ('10:00 — 13:00', '14:00 — 17:00', '18:00 — 21:00') THEN
      RAISE EXCEPTION 'Pick a time slot.';
    END IF;
    IF v_street = '' THEN
      RAISE EXCEPTION 'Add your street address.';
    END IF;
    IF v_postal !~ '^\d{6}$' THEN
      RAISE EXCEPTION 'Add a 6-digit postal code.';
    END IF;
    v_fee := 10;
  END IF;

  -- contact
  IF v_name = '' OR length(v_name) > 100 THEN
    RAISE EXCEPTION 'Add your name.';
  END IF;
  IF v_phone !~ '^\+?[\d\s]{8,20}$' THEN
    RAISE EXCEPTION 'Add a phone number we can reach you on.';
  END IF;
  IF length(coalesce(p->>'note', '')) > 1000 OR length(v_street) > 200 THEN
    RAISE EXCEPTION 'That''s a little too long — please shorten it.';
  END IF;

  -- payment proof must be an image this customer actually uploaded
  IF v_proof IS NULL
     OR v_proof !~ '^[0-9a-f-]{36}\.jpg$'
     OR NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id = 'payment-proofs' AND name = v_proof)
     OR EXISTS (SELECT 1 FROM public.online_orders WHERE proof_path = v_proof) THEN
    RAISE EXCEPTION 'Upload a screenshot of your PayNow transfer.';
  END IF;

  -- items, priced from online_products
  IF jsonb_typeof(p->'items') <> 'array' OR jsonb_array_length(p->'items') = 0 THEN
    RAISE EXCEPTION 'Your bag is empty.';
  END IF;

  FOR r IN
    SELECT i.id, sum(i.qty)::int AS qty, op.name, op.price, op.status, mi.status AS item_status
    FROM jsonb_to_recordset(p->'items') AS i(id text, qty int)
    LEFT JOIN public.online_products op ON op.id = i.id
    LEFT JOIN public.menu_items mi ON mi.id = op.item_id
    GROUP BY i.id, op.name, op.price, op.status, mi.status, mi.sort, op.sort
    ORDER BY mi.sort, op.sort
  LOOP
    IF r.name IS NULL OR r.status <> 'available' OR r.item_status <> 'available' THEN
      RAISE EXCEPTION 'Something in your bag is sold out or no longer available.';
    END IF;
    IF r.qty IS NULL OR r.qty < 1 OR r.qty > 30 THEN
      RAISE EXCEPTION 'Quantities must be between 1 and 30.';
    END IF;
    v_items := v_items || jsonb_build_object('id', r.id, 'name', r.name, 'qty', r.qty, 'price', r.price);
    v_subtotal := v_subtotal + r.qty * r.price;
  END LOOP;

  -- order number: LCC-1000 … LCC-9999, retried until unused
  LOOP
    v_number := 'LCC-' || (1000 + floor(random() * 9000))::int;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.online_orders WHERE number = v_number);
  END LOOP;

  INSERT INTO public.online_orders (
    number, method, fulfil_date, slot, name, phone, telegram, email, note, address,
    items, subtotal, fee, total, proof_path
  ) VALUES (
    v_number, v_method, v_date, v_slot, v_name, v_phone,
    nullif(btrim(coalesce(p->>'telegram', '')), ''),
    nullif(btrim(coalesce(p->>'email', '')), ''),
    nullif(btrim(coalesce(p->>'note', '')), ''),
    CASE WHEN v_method = 'deliver'
      THEN concat_ws(', ', v_street, nullif(v_unit, ''), v_postal) END,
    v_items, v_subtotal, v_fee, v_subtotal + v_fee, v_proof
  )
  RETURNING * INTO v_row;

  RETURN public.online_order_public(v_row);
END;
$$;

-- 4. Menu photos
-- Public bucket: anyone can view the photos; only the admin can upload or remove them.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('menu-photos', 'menu-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']);

CREATE POLICY "menu_photo_admin_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'menu-photos');

CREATE POLICY "menu_photo_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'menu-photos');

CREATE POLICY "menu_photo_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'menu-photos');

COMMIT;

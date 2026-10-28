-- ─────────────────────────────────────────────────────────────
-- little crumb corner — Supabase database setup
-- Run this once on a fresh project in: supabase.com → your project → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────


-- ═════════════════════════════════════════════════════════════
-- 1. Home cafe sign-ups
-- ═════════════════════════════════════════════════════════════

CREATE TABLE public.signups (
  id             uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at     timestamptz DEFAULT now() NOT NULL,
  full_name      text        NOT NULL,
  telegram_phone text        NOT NULL,
  preferred_slot text,
  dietary        text,
  referral       text,
  note           text
);

ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

-- anyone can submit the sign-up form; only the admin can read / edit / delete
CREATE POLICY "allow_public_insert" ON public.signups FOR INSERT TO anon          WITH CHECK (true);
CREATE POLICY "allow_admin_select"  ON public.signups FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_admin_update"  ON public.signups FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_admin_delete"  ON public.signups FOR DELETE TO authenticated USING (true);


-- ═════════════════════════════════════════════════════════════
-- 2. In-cafe orders (taken by the admin at the home cafe)
-- ═════════════════════════════════════════════════════════════

CREATE TABLE public.orders (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at    timestamptz   DEFAULT now() NOT NULL,
  customer_name text          NOT NULL,
  total         numeric(10,2) NOT NULL DEFAULT 0,
  status        text          NOT NULL DEFAULT 'placed'
);

CREATE TABLE public.order_items (
  id         uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id   uuid          NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_name  text          NOT NULL,
  quantity   integer       NOT NULL CHECK (quantity > 0),
  unit_price numeric(10,2) NOT NULL,
  subtotal   numeric(10,2) NOT NULL
);

ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all" ON public.orders      FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "admin_all" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ═════════════════════════════════════════════════════════════
-- 3. Online orders (the public ordering site)
-- ═════════════════════════════════════════════════════════════

-- Prices and availability live here. The site reads this table to show the
-- menu, and place_online_order() prices every order from it, so editing a row
-- in Table Editor changes the site without a redeploy.
CREATE TABLE public.online_products (
  id        text          PRIMARY KEY,
  name      text          NOT NULL,
  price     numeric(10,2) NOT NULL CHECK (price >= 0),
  available boolean       NOT NULL DEFAULT true,
  sort      integer       NOT NULL DEFAULT 0
);

INSERT INTO public.online_products (id, name, price, available, sort) VALUES
  ('basque',       'basque burnt cheesecake (slice)',          5.50, true,  10),
  ('basque-whole', 'basque burnt cheesecake (whole 8")',      50.00, true,  11),
  ('brownie',      'double fudge brownie (slice)',             4.50, true,  20),
  ('brownie-7',    'double fudge brownie (whole 7" × 7")',    24.00, true,  21),
  ('brownie-10',   'double fudge brownie (whole 10" × 10")',  48.00, true,  22),
  ('strawberry',   'strawberry shortcake',                     5.00, false, 30),
  ('muffin',       'apple cinnamon muffin',                    4.00, false, 40);

ALTER TABLE public.online_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON public.online_products FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "admin_write" ON public.online_products FOR ALL    TO authenticated        USING (true) WITH CHECK (true);


CREATE TABLE public.online_orders (
  id            uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  number        text          NOT NULL UNIQUE,
  created_at    timestamptz   DEFAULT now() NOT NULL,
  status        text          NOT NULL DEFAULT 'placed'
                CHECK (status IN ('placed', 'prepared', 'ready', 'completed', 'cancelled')),
  method        text          NOT NULL CHECK (method IN ('collect', 'deliver')),
  fulfil_date   date          NOT NULL,
  slot          text          NOT NULL,
  name          text          NOT NULL,
  phone         text          NOT NULL,
  telegram      text,
  email         text,
  note          text,
  address       text,
  items         jsonb         NOT NULL,  -- [{ id, name, qty, price }]
  subtotal      numeric(10,2) NOT NULL,
  fee           numeric(10,2) NOT NULL,
  total         numeric(10,2) NOT NULL,
  payment       text          NOT NULL DEFAULT 'paynow',
  proof_path    text,                    -- object in the payment-proofs bucket
  paid          boolean       NOT NULL DEFAULT false
);

CREATE INDEX online_orders_fulfil_date_idx ON public.online_orders (fulfil_date);

-- No anon policies: customers never touch this table directly. They place
-- orders and look them up only through the two functions below.
ALTER TABLE public.online_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all" ON public.online_orders FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- What a customer is allowed to see about their own order (no proof, no paid flag).
CREATE FUNCTION public.online_order_public(o public.online_orders)
RETURNS jsonb
LANGUAGE sql
STABLE
SET search_path = public
AS $$
  SELECT jsonb_build_object(
    'number',   o.number,
    'placedAt', o.created_at,
    'status',   o.status,
    'method',   o.method,
    'date',     o.fulfil_date,
    'slot',     o.slot,
    'name',     o.name,
    'phone',    o.phone,
    'telegram', o.telegram,
    'email',    o.email,
    'note',     o.note,
    'address',  o.address,
    'payment',  o.payment,
    'items',    o.items,
    'fee',      o.fee,
    'total',    o.total
  )
$$;


-- Places an order. Prices come from online_products, never from the browser,
-- and every fulfilment rule the checkout enforces is re-checked here.
CREATE FUNCTION public.place_online_order(p jsonb)
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
    SELECT i.id, sum(i.qty)::int AS qty, op.name, op.price, op.available
    FROM jsonb_to_recordset(p->'items') AS i(id text, qty int)
    LEFT JOIN public.online_products op ON op.id = i.id
    GROUP BY i.id, op.name, op.price, op.available, op.sort
    ORDER BY op.sort
  LOOP
    IF r.name IS NULL OR NOT r.available THEN
      RAISE EXCEPTION 'Something in your bag is no longer available.';
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


-- Finds an order by number + the phone used at checkout (last 8 digits).
CREATE FUNCTION public.lookup_online_order(p_number text, p_phone text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.online_order_public(o)
  FROM public.online_orders o
  WHERE o.number = upper(btrim(p_number))
    AND length(regexp_replace(coalesce(p_phone, ''), '\D', '', 'g')) >= 8
    AND right(regexp_replace(o.phone, '\D', '', 'g'), 8)
      = right(regexp_replace(p_phone, '\D', '', 'g'), 8)
$$;

REVOKE ALL ON FUNCTION public.place_online_order(jsonb)        FROM public;
REVOKE ALL ON FUNCTION public.lookup_online_order(text, text)  FROM public;
REVOKE ALL ON FUNCTION public.online_order_public(public.online_orders) FROM public;
GRANT EXECUTE ON FUNCTION public.place_online_order(jsonb)       TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.lookup_online_order(text, text) TO anon, authenticated;


-- ═════════════════════════════════════════════════════════════
-- 4. PayNow screenshots (Storage)
-- ═════════════════════════════════════════════════════════════

-- Private bucket: customers can upload but never list or read back.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('payment-proofs', 'payment-proofs', false, 2097152, ARRAY['image/jpeg']);

CREATE POLICY "proof_public_upload" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-proofs');

CREATE POLICY "proof_admin_read" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'payment-proofs');

CREATE POLICY "proof_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'payment-proofs');

-- ─────────────────────────────────────────────────────────────
-- After running this SQL, create your admin login:
--   supabase.com → your project → Authentication → Users
--   → "Add user" → enter your email → set a password
-- ─────────────────────────────────────────────────────────────

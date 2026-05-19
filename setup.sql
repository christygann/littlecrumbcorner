-- ─────────────────────────────────────────────────────────────
-- little crumb corner — Supabase database setup
-- Run this in: supabase.com → your project → SQL Editor → New query
-- ─────────────────────────────────────────────────────────────

-- 1. Create the sign-ups table
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

-- 2. Enable Row Level Security
ALTER TABLE public.signups ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to submit the sign-up form (public inserts)
CREATE POLICY "allow_public_insert"
  ON public.signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 4. Allow your admin account to read all submissions
CREATE POLICY "allow_admin_select"
  ON public.signups
  FOR SELECT
  TO authenticated
  USING (true);

-- 5. Allow your admin account to edit submissions
CREATE POLICY "allow_admin_update"
  ON public.signups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 6. Allow your admin account to delete submissions
CREATE POLICY "allow_admin_delete"
  ON public.signups
  FOR DELETE
  TO authenticated
  USING (true);

-- ─────────────────────────────────────────────────────────────
-- After running this SQL, create your admin login:
--   supabase.com → your project → Authentication → Users
--   → "Invite user" → enter your email → set a password
-- ─────────────────────────────────────────────────────────────

# Little Crumb Corner

Website and admin dashboard for a home bakery. Visitors can order bakes online (self-collection or delivery, paid by PayNow) and look up their orders; the admin dashboard lets you view, search, edit, and export home cafe sign-ups and in-cafe orders.

## Structure

```
website/
  site/    — public website (React + Vite)
  admin/   — admin dashboard (React + Vite)
  setup.sql — Supabase database schema and RLS policies
  DEPLOY.md — deployment guide
```

## Stack

- **Frontend:** React 18, Vite, Tailwind CSS v4
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** Vercel (two separate projects)

## Local development

Each app runs independently.

```bash
# Public site
cd website/site
npm install
npm run dev

# Admin dashboard
cd website/admin
npm install
npm run dev
```

Create a `.env` file in each folder:

```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Database setup

1. Create a project at [supabase.com](https://supabase.com) (region: Southeast Asia (Singapore)).
2. SQL Editor → New query → paste all of `website/setup.sql` → Run. It creates every table, policy, function and the private `payment-proofs` storage bucket.
3. Authentication → Users → Add user → your email + a password (this is the admin login).
4. Project Settings → API: copy the **Project URL** and the **anon public** key into both `.env` files (and Vercel).

## Online orders

- Prices and availability come from the `online_products` table. Edit a row in Table Editor (e.g. set `available` to true for strawberry shortcake) and the site follows, no redeploy needed. Photos, blurbs and sizes live in `site/src/data.js`.
- Orders are placed through the `place_online_order` database function, which re-prices the order and re-checks every rule (two days' lead time, Sat/Sun collection, no Monday delivery, 6-digit postal code, uploaded PayNow screenshot). Customers can't read or write `online_orders` directly.
- New orders appear in Table Editor → `online_orders`; PayNow screenshots are in Storage → `payment-proofs` (the file name is in `proof_path`). Change `status` to `prepared` → `ready` → `completed` and customers see it under "my orders".
- The PayNow QR is served from `assets/paynow-qr.png`.

## Deployment

See [DEPLOY.md](website/DEPLOY.md) for full instructions. The short version:

1. Push to GitHub
2. Import the repo in Vercel **twice** — once with root `website/site`, once with root `website/admin`
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in both projects

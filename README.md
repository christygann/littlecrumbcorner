# Little Crumb Corner

Website and admin dashboard for a home cafe. Visitors can browse the menu and sign up for a session; the admin dashboard lets you view, search, edit, and export sign-ups.

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
- **Backend:** Supabase (PostgreSQL + Auth)
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

Run `website/setup.sql` once in your Supabase project's SQL Editor. Then create your admin user under Authentication → Users → Invite user.

## Deployment

See [DEPLOY.md](website/DEPLOY.md) for full instructions. The short version:

1. Push to GitHub
2. Import the repo in Vercel **twice** — once with root `website/site`, once with root `website/admin`
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in both projects

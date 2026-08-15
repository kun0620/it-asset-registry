# IT Asset Registry

Internal asset tracking tool. Personal use.

## Setup

```bash
npm install
cp .env.example .env.local   # fill in Supabase credentials
npm run dev
```

### Environment variables

| Variable | Where to find it |
|---|---|
| `SUPABASE_URL` | Supabase → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API (anon/publishable key) |

Deliberately **not** `NEXT_PUBLIC_`-prefixed: RLS is currently disabled on
every table (see Security Notes below), so these keys are read only in
server-side code and must never reach the browser bundle.

Never commit `.env.local`. Never use the service_role key in this app.

## Database

Migrations live in `/supabase/migrations`, applied in order via the
Supabase SQL Editor (or `supabase db push` if you've linked the project
with the CLI):

- `20260815092017_init_assets_schema.sql` — `assets`, `asset_logs`
- `20260815095306_add_work_log_and_settings.sql` — `work_logs`, `app_settings`
  (the Settings page's singleton config row: asset tag prefix, location
  list, asset type list)

## Security notes

Row Level Security is **disabled** on every table by design — this is a
single-user, localhost-only tool with no auth. The Supabase anon key is
treated as a server-side secret to compensate (see above). Before exposing
this app beyond localhost, add auth and RLS policies first.

## Status

Phase 2 — Asset CRUD, Work Log, Settings. See AGENTS.md for what is
intentionally not built yet (network monitoring, i18n, ticketing, user
management).
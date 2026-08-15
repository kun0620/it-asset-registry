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
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API |

Never commit `.env.local`. Never use the service_role key in this app.

## Database

Migrations live in `/supabase/migrations`. Run them in the Supabase
SQL Editor, or via `supabase db push` if using the CLI.

## Status

Phase 1 — Asset CRUD. See AGENTS.md for what is intentionally not built yet.
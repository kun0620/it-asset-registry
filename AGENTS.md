# IT Asset Registry

Personal internal tool for a single IT engineer. Not a SaaS product.
No multi-tenancy, no org_id, no billing.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind + shadcn/ui
- Supabase (Postgres + Auth)

## Current scope — Phase 1 ONLY
Asset CRUD. Nothing else.
- Dashboard (asset stat cards, warranty expiring, recent activity)
- Asset List (table, search, filter by type/status/location, CSV export)
- Asset Detail (edit form + audit timeline)

## Deferred — do NOT build yet
Work Log, Settings, network monitoring, i18n, ticketing, user management.
Leave nav placeholders disabled if referenced.

## Data model (Phase 1)
assets
  id uuid pk, asset_tag text unique, type text, brand text, model text,
  serial text, status text, assigned_to text, location text,
  purchase_date date, warranty_end date, notes text,
  created_at timestamptz, updated_at timestamptz

asset_logs
  id uuid pk, asset_id uuid references assets(id) on delete cascade,
  action text, detail text, created_at timestamptz

Status values: In Use | In Stock | Repair | Disposed
Types: Laptop, Desktop, Monitor, Printer, Switch, Router, Firewall,
       UPS, Phone, Other

Note: a future work_logs table must reference asset_id (uuid FK),
never asset_tag as a string.

## Conventions
- UI language: English only. No i18n layer, no t() wrapper.
- Data may contain Thai text (names, locations, notes) — that is fine.
- Use standard shadcn/ui components. Do not hand-roll tables or dialogs.
- Desktop-first at 1440px. Data density over decoration.
- No complex animation, gradients, or illustration.
- RLS enabled on every table.

## Design reference
Mockup screenshots live in /docs/mockups.
Treat them as visual reference only — do not port their inline styles.
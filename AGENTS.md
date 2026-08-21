# IT Asset Registry

Personal internal tool for a single IT engineer. Not a SaaS product.
No multi-tenancy, no org_id, no billing.

## Stack
- Next.js 16 (App Router) + TypeScript
- Tailwind + shadcn/ui
- Supabase (Postgres + Auth)

## Current scope — Phase 1 + 2 + 3 done
Phase 1 — Asset CRUD:
- Dashboard (asset stat cards, warranty expiring, recent activity)
- Asset List (table, search, filter by type/status/location, CSV export/import)
- Asset Detail (edit form + audit timeline)

Phase 2 — Work Log + Settings:
- Work Log (grouped-by-date entries, search/range/category/status filters,
  CSV + Markdown export, optionally linked to an asset)
- Settings (Appearance: light/dark/system theme; Asset Configuration: asset
  tag prefix, location list, asset type list — these are the authoritative
  source for Asset List/Detail dropdowns, not derived from existing asset
  data; Data: export all, CSV import)
- Dashboard's Work Log Summary section (week/month counts, 30-day category
  breakdown, 91-day activity heatmap, recent logs)

Phase 3 — Inventory:
- Quantity-tracked consumables/bulk items (cables, adapters, etc.) —
  deliberately separate from `assets`, which is for individually-tracked
  capital equipment. Search by name, add/edit/delete via a per-row dialog.
  No reorder/low-stock alerts, no Work Log linkage, no CSV export/import,
  no Dashboard integration — quantity is edited directly on the page.
  Any of these can be added later without a schema change.

## Deferred — do NOT build yet
Network monitoring, i18n, ticketing, user management, auth.
Leave nav placeholders disabled if referenced.

## Data model
assets
  id uuid pk, asset_tag text unique, type text, brand text, model text,
  serial text, status text, assigned_to text, location text,
  purchase_date date, warranty_end date, notes text,
  created_at timestamptz, updated_at timestamptz

asset_logs
  id uuid pk, asset_id uuid references assets(id) on delete cascade,
  action text, detail text, created_at timestamptz

work_logs
  id uuid pk, asset_id uuid references assets(id) on delete set null
  (nullable — a log doesn't have to be about a specific asset),
  log_date date, title text, category text, status text,
  duration_min int, detail text, tags text[],
  created_at timestamptz, updated_at timestamptz

app_settings — singleton row (id boolean pk, always true)
  asset_tag_prefix text, locations text[], asset_types text[],
  updated_at timestamptz

inventory_items
  id uuid pk, name text, quantity int (>= 0), unit text (default 'pcs'),
  location text (free text, not FK'd to app_settings.locations),
  notes text, created_at timestamptz, updated_at timestamptz

Status values: In Use | In Stock | Repair | Disposed
Work log category values: Incident | Maintenance | Project | Procurement |
  Meeting | Other
Work log status values: Done | In Progress | Blocked

Asset types and locations are no longer a fixed list in code — they're
read from `app_settings`, editable via Settings → Asset Configuration.

## Conventions
- UI language: English only. No i18n layer, no t() wrapper.
- Data may contain Thai text (names, locations, notes) — that is fine.
- Use standard shadcn/ui components. Do not hand-roll tables or dialogs.
- Desktop-first at 1440px. Data density over decoration.
- No complex animation, gradients, or illustration.
- RLS is disabled on every table — deliberate, not an oversight (single-user,
  localhost-only tool with no auth). See README's Security Notes before
  changing this or exposing the app beyond localhost.

## Design reference
Mockup screenshots live in /docs/mockups.
Treat them as visual reference only — do not port their inline styles.
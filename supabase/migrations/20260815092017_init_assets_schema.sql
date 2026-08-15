-- Phase 1 schema: assets + their audit trail. RLS intentionally left
-- disabled — this is a localhost-only, single-user tool for now (see
-- AGENTS.md and the README's Security Notes section).
create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  asset_tag text not null unique,
  type text not null,
  brand text,
  model text,
  serial text,
  status text not null default 'In Stock' check (status in ('In Use','In Stock','Repair','Disposed')),
  assigned_to text,
  location text,
  purchase_date date,
  warranty_end date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists asset_logs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references assets(id) on delete cascade,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists asset_logs_asset_id_idx on asset_logs(asset_id);
create index if not exists asset_logs_created_at_idx on asset_logs(created_at desc);

create or replace function set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assets_set_updated_at on assets;
create trigger assets_set_updated_at
  before update on assets
  for each row execute function set_updated_at();

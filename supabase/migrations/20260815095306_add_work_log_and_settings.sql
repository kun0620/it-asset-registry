-- Singleton config row — no auth/multi-tenancy per AGENTS.md, so one row is enough.
create table if not exists app_settings (
  id boolean primary key default true,
  constraint app_settings_singleton check (id),
  asset_tag_prefix text not null default 'WDI-',
  locations text[] not null default array['Office 2F','Office 3F','Production Line 1','Production Line 2','Production Line 3','Warehouse','Server Room','QC Lab','IT Store Room'],
  asset_types text[] not null default array['Laptop','Desktop','Monitor','Printer','Switch','Router','Firewall','UPS','Phone','Other'],
  updated_at timestamptz not null default now()
);
insert into app_settings (id) values (true) on conflict (id) do nothing;

drop trigger if exists app_settings_set_updated_at on app_settings;
create trigger app_settings_set_updated_at before update on app_settings
  for each row execute function set_updated_at();

create table if not exists work_logs (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid references assets(id) on delete set null,
  log_date date not null,
  title text not null,
  category text not null check (category in ('Incident','Maintenance','Project','Procurement','Meeting','Other')),
  status text not null default 'Done' check (status in ('Done','In Progress','Blocked')),
  duration_min integer not null default 0,
  detail text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists work_logs_log_date_idx on work_logs(log_date desc, created_at desc);
create index if not exists work_logs_asset_id_idx on work_logs(asset_id);

drop trigger if exists work_logs_set_updated_at on work_logs;
create trigger work_logs_set_updated_at before update on work_logs
  for each row execute function set_updated_at();

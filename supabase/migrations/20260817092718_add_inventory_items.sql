create table if not exists inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity integer not null default 0 check (quantity >= 0),
  unit text not null default 'pcs',
  location text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists inventory_items_name_idx on inventory_items(name);

drop trigger if exists inventory_items_set_updated_at on inventory_items;
create trigger inventory_items_set_updated_at before update on inventory_items
  for each row execute function set_updated_at();

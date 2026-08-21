alter table assets enable row level security;
alter table asset_logs enable row level security;
alter table work_logs enable row level security;
alter table inventory_items enable row level security;
alter table app_settings enable row level security;

create policy "Authenticated users have full access" on assets
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users have full access" on asset_logs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users have full access" on work_logs
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users have full access" on inventory_items
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "Authenticated users have full access" on app_settings
  for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

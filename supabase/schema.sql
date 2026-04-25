create table if not exists public.app_state (
  id text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state replica identity full;

alter table public.app_state enable row level security;

drop policy if exists "Public read app state" on public.app_state;
create policy "Public read app state"
  on public.app_state
  for select
  using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'app_state'
  ) then
    alter publication supabase_realtime add table public.app_state;
  end if;
end $$;

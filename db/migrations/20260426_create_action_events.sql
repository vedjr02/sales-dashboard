create extension if not exists pgcrypto;

create table if not exists public.action_events (
  id uuid primary key default gen_random_uuid(),
  area text not null,
  action text not null,
  status text not null check (status in ('success', 'error')),
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists idx_action_events_area_created_at
  on public.action_events (area, created_at desc);

create index if not exists idx_action_events_action_created_at
  on public.action_events (action, created_at desc);

alter table public.action_events enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'action_events'
      and policyname = 'action_events_read_authenticated'
  ) then
    create policy action_events_read_authenticated
      on public.action_events
      for select
      to authenticated
      using (true);
  end if;
end $$;

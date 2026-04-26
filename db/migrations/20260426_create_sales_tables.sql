create extension if not exists pgcrypto;

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  company text not null,
  status text not null default 'new',
  source text not null default 'website',
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  lead_id text not null,
  amount numeric not null default 0,
  currency text not null default 'USD',
  stage text not null default 'prospecting',
  close_date timestamptz not null default now(),
  probability numeric not null default 50,
  assigned_to text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  value numeric not null default 0,
  currency text not null default 'USD',
  status text not null default 'pipeline',
  close_date timestamptz not null default now(),
  team_id text not null default 'unassigned',
  created_by text not null default 'system',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_leads_created_at on public.leads (created_at desc);
create index if not exists idx_opportunities_created_at on public.opportunities (created_at desc);
create index if not exists idx_deals_close_date on public.deals (close_date asc);

alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.deals enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'leads'
      and policyname = 'leads_select_authenticated'
  ) then
    create policy leads_select_authenticated
      on public.leads
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'opportunities'
      and policyname = 'opportunities_select_authenticated'
  ) then
    create policy opportunities_select_authenticated
      on public.opportunities
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'deals'
      and policyname = 'deals_select_authenticated'
  ) then
    create policy deals_select_authenticated
      on public.deals
      for select
      to anon, authenticated
      using (true);
  end if;
end $$;
-- Households table
create table public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Otthon',
  invite_code text unique not null default upper(substring(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  created_at timestamptz default now()
);

-- Profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  household_id uuid references public.households(id),
  name text not null,
  color text not null default '#7c3aed',
  created_at timestamptz default now()
);

-- Transactions table
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  category text not null,
  description text,
  date date not null,
  ai_analyzed boolean default false,
  created_at timestamptz default now()
);

-- Recurring templates table
create table public.recurring_templates (
  id uuid primary key default gen_random_uuid(),
  household_id uuid references public.households(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  amount numeric not null check (amount > 0),
  category text not null,
  due_day integer not null check (due_day between 1 and 31),
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Recurring instances table
create table public.recurring_instances (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.recurring_templates(id) on delete cascade not null,
  year integer not null,
  month integer not null,
  paid_at timestamptz,
  paid_by_user_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  unique(template_id, year, month)
);

-- Enable Row Level Security
alter table public.households enable row level security;
alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.recurring_templates enable row level security;
alter table public.recurring_instances enable row level security;

-- Helper: get current user's household_id
create or replace function public.get_my_household_id()
returns uuid
language sql
security definer
stable
as $$
  select household_id from public.profiles where id = auth.uid();
$$;

-- RLS: households
create policy "household_select" on public.households for select
  using (id = public.get_my_household_id());

-- RLS: profiles
create policy "profiles_select" on public.profiles for select
  using (household_id = public.get_my_household_id());

create policy "profiles_insert" on public.profiles for insert
  with check (id = auth.uid());

create policy "profiles_update" on public.profiles for update
  using (id = auth.uid());

-- RLS: transactions
create policy "transactions_select" on public.transactions for select
  using (household_id = public.get_my_household_id());

create policy "transactions_insert" on public.transactions for insert
  with check (household_id = public.get_my_household_id());

create policy "transactions_update" on public.transactions for update
  using (household_id = public.get_my_household_id());

create policy "transactions_delete" on public.transactions for delete
  using (household_id = public.get_my_household_id());

-- RLS: recurring_templates
create policy "templates_select" on public.recurring_templates for select
  using (household_id = public.get_my_household_id());

create policy "templates_insert" on public.recurring_templates for insert
  with check (household_id = public.get_my_household_id());

create policy "templates_update" on public.recurring_templates for update
  using (household_id = public.get_my_household_id());

create policy "templates_delete" on public.recurring_templates for delete
  using (household_id = public.get_my_household_id());

-- RLS: recurring_instances
create policy "instances_select" on public.recurring_instances for select
  using (
    template_id in (
      select id from public.recurring_templates
      where household_id = public.get_my_household_id()
    )
  );

create policy "instances_insert" on public.recurring_instances for insert
  with check (
    template_id in (
      select id from public.recurring_templates
      where household_id = public.get_my_household_id()
    )
  );

create policy "instances_update" on public.recurring_instances for update
  using (
    template_id in (
      select id from public.recurring_templates
      where household_id = public.get_my_household_id()
    )
  );

-- Function: create household (first user)
create or replace function public.create_household(p_name text, p_color text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_household_id uuid;
  v_invite_code text;
begin
  insert into public.households default values
  returning id, invite_code into v_household_id, v_invite_code;

  insert into public.profiles (id, household_id, name, color)
  values (auth.uid(), v_household_id, p_name, p_color);

  return json_build_object(
    'success', true,
    'household_id', v_household_id,
    'invite_code', v_invite_code
  );
end;
$$;

-- Function: join household by invite code (second user)
create or replace function public.join_household(p_invite_code text, p_name text, p_color text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_household_id uuid;
begin
  select id into v_household_id
  from public.households
  where upper(invite_code) = upper(p_invite_code);

  if v_household_id is null then
    return json_build_object('error', 'Érvénytelen meghívókód');
  end if;

  insert into public.profiles (id, household_id, name, color)
  values (auth.uid(), v_household_id, p_name, p_color)
  on conflict (id) do update
  set household_id = v_household_id, name = p_name, color = p_color;

  return json_build_object('success', true, 'household_id', v_household_id);
end;
$$;

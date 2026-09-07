-- =====================================================================
-- TripSplit — Supabase schema
-- Run this whole file once in the Supabase SQL editor for a fresh project.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- TABLES
-- ---------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamptz not null default now()
);

create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  start_date date,
  end_date date,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  member_name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  description text not null,
  amount numeric(12, 2) not null check (amount > 0),
  category text not null check (
    category in ('Food', 'Hotel', 'Transport', 'Activities', 'Shopping', 'Entertainment', 'Other')
  ),
  paid_by uuid not null references public.trip_members(id) on delete restrict,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.expense_participants (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references public.expenses(id) on delete cascade,
  member_id uuid not null references public.trip_members(id) on delete cascade,
  share_amount numeric(12, 2) not null check (share_amount >= 0),
  unique (expense_id, member_id)
);

create table if not exists public.settlements (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  from_member uuid not null references public.trip_members(id) on delete cascade,
  to_member uuid not null references public.trip_members(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  settled boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_trip_members_trip on public.trip_members(trip_id);
create index if not exists idx_trip_members_user on public.trip_members(user_id);
create index if not exists idx_expenses_trip on public.expenses(trip_id);
create index if not exists idx_expense_participants_expense on public.expense_participants(expense_id);
create index if not exists idx_settlements_trip on public.settlements(trip_id);

-- ---------------------------------------------------------------------
-- HELPER FUNCTIONS (security definer to avoid RLS self-recursion)
-- ---------------------------------------------------------------------

create or replace function public.is_trip_member(_trip_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trip_members
    where trip_id = _trip_id and user_id = auth.uid()
  );
$$;

create or replace function public.is_trip_owner(_trip_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.trips
    where id = _trip_id and created_by = auth.uid()
  );
$$;

create or replace function public.is_expense_trip_member(_expense_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.expenses e
    where e.id = _expense_id and public.is_trip_member(e.trip_id)
  );
$$;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.trips enable row level security;
alter table public.trip_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_participants enable row level security;
alter table public.settlements enable row level security;

-- profiles: users only ever see/edit their own profile row.
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
  for insert with check (id = auth.uid());
create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- trips: visible/editable to members; only the creator can delete.
create policy "trips_select_member" on public.trips
  for select using (public.is_trip_member(id) or created_by = auth.uid());
create policy "trips_insert_own" on public.trips
  for insert with check (created_by = auth.uid());
create policy "trips_update_owner" on public.trips
  for update using (created_by = auth.uid());
create policy "trips_delete_owner" on public.trips
  for delete using (created_by = auth.uid());

-- trip_members: visible to members; the trip owner can always add the first
-- members (chicken-and-egg on trip creation), after that any member can add more.
create policy "trip_members_select" on public.trip_members
  for select using (public.is_trip_member(trip_id));
create policy "trip_members_insert" on public.trip_members
  for insert with check (public.is_trip_owner(trip_id) or public.is_trip_member(trip_id));
create policy "trip_members_update" on public.trip_members
  for update using (public.is_trip_member(trip_id));
create policy "trip_members_delete" on public.trip_members
  for delete using (public.is_trip_member(trip_id));

-- expenses: any trip member can create/view/edit/delete expenses in their trip.
create policy "expenses_select" on public.expenses
  for select using (public.is_trip_member(trip_id));
create policy "expenses_insert" on public.expenses
  for insert with check (public.is_trip_member(trip_id));
create policy "expenses_update" on public.expenses
  for update using (public.is_trip_member(trip_id));
create policy "expenses_delete" on public.expenses
  for delete using (public.is_trip_member(trip_id));

-- expense_participants: scoped through the parent expense's trip.
create policy "expense_participants_select" on public.expense_participants
  for select using (public.is_expense_trip_member(expense_id));
create policy "expense_participants_insert" on public.expense_participants
  for insert with check (public.is_expense_trip_member(expense_id));
create policy "expense_participants_update" on public.expense_participants
  for update using (public.is_expense_trip_member(expense_id));
create policy "expense_participants_delete" on public.expense_participants
  for delete using (public.is_expense_trip_member(expense_id));

-- settlements: scoped to trip members.
create policy "settlements_select" on public.settlements
  for select using (public.is_trip_member(trip_id));
create policy "settlements_insert" on public.settlements
  for insert with check (public.is_trip_member(trip_id));
create policy "settlements_update" on public.settlements
  for update using (public.is_trip_member(trip_id));

-- ---------------------------------------------------------------------
-- STORAGE: bucket + policies for expense photos
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('expense-photos', 'expense-photos', true)
on conflict (id) do nothing;

-- Public bucket => anyone with a URL can view the photo (needed so <img> tags
-- work without extra auth headers). Only authenticated users can upload/delete.
create policy "expense_photos_public_read" on storage.objects
  for select using (bucket_id = 'expense-photos');

create policy "expense_photos_authenticated_insert" on storage.objects
  for insert with check (bucket_id = 'expense-photos' and auth.role() = 'authenticated');

create policy "expense_photos_authenticated_update" on storage.objects
  for update using (bucket_id = 'expense-photos' and auth.role() = 'authenticated');

create policy "expense_photos_authenticated_delete" on storage.objects
  for delete using (bucket_id = 'expense-photos' and auth.role() = 'authenticated');

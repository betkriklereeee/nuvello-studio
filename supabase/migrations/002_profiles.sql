-- profiles: extends auth.users with role and display info
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'client',
  full_name text,
  company text,
  created_at timestamptz default now(),
  constraint profiles_role_check check (role in ('admin', 'client'))
);

-- Enable RLS
alter table profiles enable row level security;

-- Users can read their own profile
create policy "profiles_select_own" on profiles
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "profiles_update_own" on profiles
  for update using (auth.uid() = id);

-- Auto-create a 'client' profile row when a new auth user signs up.
-- Admin profiles are promoted manually via seed.sql or the Supabase dashboard.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'client')
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

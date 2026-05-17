-- Seed: promote a user to admin role
--
-- After your first login, find your user ID in:
--   Supabase Dashboard → Authentication → Users
-- Then replace the UUID below and run this against your database.
--
-- The trigger in 002_profiles.sql will have already created a 'client' profile
-- for this user; this upsert promotes it to 'admin'.

insert into public.profiles (id, role, full_name)
values (
  '00000000-0000-0000-0000-000000000000', -- ← replace with your auth user ID
  'admin',
  'Admin'
)
on conflict (id) do update
  set role = 'admin';

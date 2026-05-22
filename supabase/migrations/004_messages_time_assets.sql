-- ── Messages ──────────────────────────────────────────────────────────────────
create table if not exists messages (
  id         uuid        primary key default gen_random_uuid(),
  project_id uuid        not null references projects(id) on delete cascade,
  client_id  uuid        not null references clients(id)  on delete cascade,
  message    text        not null,
  read       boolean     not null default false,
  created_at timestamptz not null default now()
);

alter table messages enable row level security;

create policy "Clients insert own messages"
  on messages for insert
  with check (
    client_id in (select id from clients where client_user_id = auth.uid())
  );

create policy "Clients select own messages"
  on messages for select
  using (
    client_id in (select id from clients where client_user_id = auth.uid())
  );

-- ── Time Entries ──────────────────────────────────────────────────────────────
create table if not exists time_entries (
  id          uuid          primary key default gen_random_uuid(),
  project_id  uuid          not null references projects(id) on delete cascade,
  hours       decimal(10,2) not null,
  description text,
  logged_by   uuid          references auth.users(id) on delete set null,
  created_at  timestamptz   not null default now()
);

alter table time_entries enable row level security;

-- Clients can only read time entries for their own projects
create policy "Clients select own project time entries"
  on time_entries for select
  using (
    project_id in (
      select p.id from projects p
      join clients c on c.id = p.client_id
      where c.client_user_id = auth.uid()
    )
  );

-- ── Projects: add estimated_hours ─────────────────────────────────────────────
alter table projects add column if not exists estimated_hours decimal(10,2);

-- ── Storage Bucket ────────────────────────────────────────────────────────────
-- NOTE: Create the "project-assets" bucket manually in the Supabase dashboard
-- (Storage → New bucket → name: project-assets, public: off, 10 MB limit)
-- or run this SQL if your Supabase version supports it:
insert into storage.buckets (id, name, public, file_size_limit)
values ('project-assets', 'project-assets', false, 10485760)
on conflict (id) do nothing;

-- ── Storage RLS ───────────────────────────────────────────────────────────────
-- Clients may upload/read/delete files in their own project's folder
-- (folder = first path segment = project_id)

create policy "Clients upload own project assets"
  on storage.objects for insert
  with check (
    bucket_id = 'project-assets'
    and split_part(name, '/', 1) in (
      select p.id::text from projects p
      join clients c on c.id = p.client_id
      where c.client_user_id = auth.uid()
    )
  );

create policy "Clients select own project assets"
  on storage.objects for select
  using (
    bucket_id = 'project-assets'
    and split_part(name, '/', 1) in (
      select p.id::text from projects p
      join clients c on c.id = p.client_id
      where c.client_user_id = auth.uid()
    )
  );

create policy "Clients delete own project assets"
  on storage.objects for delete
  using (
    bucket_id = 'project-assets'
    and split_part(name, '/', 1) in (
      select p.id::text from projects p
      join clients c on c.id = p.client_id
      where c.client_user_id = auth.uid()
    )
  );

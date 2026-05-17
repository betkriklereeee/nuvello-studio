-- Enable UUID extension
create extension if not exists "pgcrypto";

-- clients
create table clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  company text,
  pipedrive_deal_id text,
  created_at timestamptz default now()
);

-- projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  status text not null default 'discovery',
  services text[],
  created_at timestamptz default now(),
  constraint projects_status_check check (status in ('discovery', 'design', 'build', 'launch', 'complete'))
);

-- milestones
create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  status text not null default 'pending',
  due_date date,
  sort_order integer default 0,
  created_at timestamptz default now(),
  constraint milestones_status_check check (status in ('pending', 'in_progress', 'complete'))
);

-- deliverables
create table deliverables (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  title text not null,
  file_url text,
  status text not null default 'pending',
  revision_notes text,
  created_at timestamptz default now(),
  constraint deliverables_status_check check (status in ('pending', 'approved', 'revision'))
);

-- drive_folders
create table drive_folders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  folder_id text not null,
  folder_url text not null,
  created_at timestamptz default now()
);

-- Enable RLS on all tables
alter table clients enable row level security;
alter table projects enable row level security;
alter table milestones enable row level security;
alter table deliverables enable row level security;
alter table drive_folders enable row level security;

-- RLS Policies
-- clients: user can read their own record (auth.uid() = client.id)
create policy "clients_select_own" on clients
  for select using (auth.uid() = id);

-- projects: user can read projects for their client
create policy "projects_select_own" on projects
  for select using (
    exists (
      select 1 from clients
      where clients.id = projects.client_id
      and clients.id = auth.uid()
    )
  );

-- milestones: user can read milestones for their projects
create policy "milestones_select_own" on milestones
  for select using (
    exists (
      select 1 from projects
      join clients on clients.id = projects.client_id
      where projects.id = milestones.project_id
      and clients.id = auth.uid()
    )
  );

-- deliverables: user can read deliverables for their projects
create policy "deliverables_select_own" on deliverables
  for select using (
    exists (
      select 1 from projects
      join clients on clients.id = projects.client_id
      where projects.id = deliverables.project_id
      and clients.id = auth.uid()
    )
  );

-- deliverables: client can update status/revision_notes on their deliverables
create policy "deliverables_update_own" on deliverables
  for update using (
    exists (
      select 1 from projects
      join clients on clients.id = projects.client_id
      where projects.id = deliverables.project_id
      and clients.id = auth.uid()
    )
  );

-- drive_folders: user can read their own drive folders
create policy "drive_folders_select_own" on drive_folders
  for select using (
    exists (
      select 1 from clients
      where clients.id = drive_folders.client_id
      and clients.id = auth.uid()
    )
  );

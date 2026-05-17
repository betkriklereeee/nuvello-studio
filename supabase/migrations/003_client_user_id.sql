-- Add client_user_id to link clients table to Supabase auth users
alter table clients
  add column if not exists client_user_id uuid references auth.users(id) on delete set null;

create index if not exists clients_client_user_id_idx on clients(client_user_id);

-- Update RLS policies to use client_user_id instead of id
drop policy if exists "Clients can view own record" on clients;
create policy "Clients can view own record"
  on clients for select
  using (client_user_id = auth.uid());

drop policy if exists "Clients can view own projects" on projects;
create policy "Clients can view own projects"
  on projects for select
  using (
    client_id in (
      select id from clients where client_user_id = auth.uid()
    )
  );

drop policy if exists "Clients can view own milestones" on milestones;
create policy "Clients can view own milestones"
  on milestones for select
  using (
    project_id in (
      select p.id from projects p
      join clients c on c.id = p.client_id
      where c.client_user_id = auth.uid()
    )
  );

drop policy if exists "Clients can view own deliverables" on deliverables;
create policy "Clients can view own deliverables"
  on deliverables for select
  using (
    project_id in (
      select p.id from projects p
      join clients c on c.id = p.client_id
      where c.client_user_id = auth.uid()
    )
  );

drop policy if exists "Clients can update own deliverables" on deliverables;
create policy "Clients can update own deliverables"
  on deliverables for update
  using (
    project_id in (
      select p.id from projects p
      join clients c on c.id = p.client_id
      where c.client_user_id = auth.uid()
    )
  );

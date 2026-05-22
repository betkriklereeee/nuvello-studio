import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectsTable } from '@/components/admin/ProjectsTable'
import type { Client, Project } from '@/lib/types'

export const metadata = { title: 'Projects — Nuvello Studio' }

interface Props {
  searchParams: { client?: string }
}

export default async function ProjectsPage({ searchParams }: Props) {
  const db = createAdminClient()

  const [{ data: projects }, { data: clients }] = await Promise.all([
    db
      .from('projects')
      .select('*, clients(name)')
      .order('created_at', { ascending: false }),
    db.from('clients').select('id, name, company').order('name'),
  ])

  return (
    <ProjectsTable
      projects={(projects as Project[]) ?? []}
      clients={(clients as Client[]) ?? []}
      defaultClientId={searchParams.client}
    />
  )
}

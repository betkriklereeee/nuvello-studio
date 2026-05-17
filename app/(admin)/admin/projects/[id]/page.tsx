import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectStatusBadge } from '@/components/admin/StatusBadge'
import { ProjectStatusUpdater } from '@/components/admin/ProjectStatusUpdater'
import { MilestoneList } from '@/components/admin/MilestoneList'
import { DeliverablesSection } from '@/components/admin/DeliverablesSection'
import { DriveFolderSection } from '@/components/admin/DriveFolderSection'
import type { Milestone, Deliverable, DriveFolder, ProjectStatus } from '@/lib/types'

interface Props {
  params: { id: string }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E0EB]">
      <div className="px-6 py-4 border-b border-[#E2E0EB]">
        <h2 className="text-sm font-semibold text-[#2B2B2E]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

export default async function ProjectDetailPage({ params }: Props) {
  const db = createAdminClient()

  const { data: project } = await db
    .from('projects')
    .select('*, clients(id, name)')
    .eq('id', params.id)
    .single()

  if (!project) notFound()

  const [{ data: milestones }, { data: deliverables }, { data: driveData }] = await Promise.all([
    db
      .from('milestones')
      .select('*')
      .eq('project_id', params.id)
      .order('sort_order'),
    db
      .from('deliverables')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at'),
    db
      .from('drive_folders')
      .select('*')
      .eq('project_id', params.id)
      .maybeSingle(),
  ])

  const client = project.clients as { id: string; name: string } | null

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-1.5 text-sm text-[#9490A8] hover:text-[#2B2B2E] transition-colors"
      >
        <ArrowLeft size={14} />
        All Projects
      </Link>

      {/* Project header */}
      <div className="bg-white rounded-xl border border-[#E2E0EB] p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-semibold text-[#2B2B2E]">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            {client && (
              <Link
                href={`/admin/clients/${client.id}`}
                className="text-sm text-[#5A5575] hover:text-[#1E1F6B] mt-1 inline-block"
              >
                {client.name}
              </Link>
            )}
            {project.services && project.services.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {project.services.map((s: string) => (
                  <span
                    key={s}
                    className="px-2.5 py-0.5 rounded-full bg-[#F8F8FA] border border-[#E2E0EB] text-xs text-[#5A5575]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Status updater */}
          <div className="flex-shrink-0">
            <label className="block text-xs font-medium text-[#9490A8] mb-1.5">
              Update Status
            </label>
            <ProjectStatusUpdater
              projectId={project.id}
              currentStatus={project.status as ProjectStatus}
            />
          </div>
        </div>
      </div>

      {/* Milestones */}
      <Section title="Milestones">
        <MilestoneList
          projectId={project.id}
          initialMilestones={(milestones as Milestone[]) ?? []}
        />
      </Section>

      {/* Deliverables */}
      <Section title="Deliverables">
        <DeliverablesSection
          projectId={project.id}
          initialDeliverables={(deliverables as Deliverable[]) ?? []}
        />
      </Section>

      {/* Google Drive */}
      <Section title="Google Drive Folder">
        <DriveFolderSection
          projectId={project.id}
          clientId={client?.id ?? ''}
          existing={(driveData as DriveFolder) ?? null}
        />
      </Section>
    </div>
  )
}

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectStatusBadge } from '@/components/admin/StatusBadge'
import { ProjectStatusUpdater } from '@/components/admin/ProjectStatusUpdater'
import { MilestoneList } from '@/components/admin/MilestoneList'
import { DeliverablesSection } from '@/components/admin/DeliverablesSection'
import { DriveFolderSection } from '@/components/admin/DriveFolderSection'
import { MessagesSection } from '@/components/admin/MessagesSection'
import { TimeSection } from '@/components/admin/TimeSection'
import { AssetsSection } from '@/components/admin/AssetsSection'
import { BicPanel } from '@/components/admin/BicPanel'
import { listProjectAssets } from '@/lib/actions'
import type { Milestone, Deliverable, DriveFolder, ProjectStatus, Message, TimeEntry, BicStatus, Annotation } from '@/lib/types'

export const metadata = { title: 'Project — Nuvello Studio' }

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

  const [
    { data: milestones },
    { data: deliverables },
    { data: driveData },
    { data: messages },
    { data: timeEntries },
    assets,
  ] = await Promise.all([
    db.from('milestones').select('*').eq('project_id', params.id).order('sort_order'),
    db.from('deliverables').select('*').eq('project_id', params.id).order('created_at'),
    db.from('drive_folders').select('*').eq('project_id', params.id).maybeSingle(),
    db
      .from('messages')
      .select('*, clients(name)')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false }),
    db
      .from('time_entries')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false }),
    listProjectAssets(params.id),
  ])

  // Batch-fetch annotations for all deliverables
  const deliverableIds = (deliverables ?? []).map((d) => d.id)
  const { data: allAnnotations } = deliverableIds.length > 0
    ? await db.from('annotations').select('*').in('deliverable_id', deliverableIds).order('created_at', { ascending: true })
    : { data: [] as Annotation[] }

  const annotationsByDeliverable: Record<string, Annotation[]> = {}
  for (const ann of allAnnotations ?? []) {
    if (!annotationsByDeliverable[ann.deliverable_id]) annotationsByDeliverable[ann.deliverable_id] = []
    annotationsByDeliverable[ann.deliverable_id].push(ann as Annotation)
  }

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
        <div className="flex items-start justify-between gap-4 flex-wrap">
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

      {/* Ball in Your Court */}
      <BicPanel
        projectId={project.id}
        initialStatus={(project.bic_status ?? 'admin') as BicStatus}
        initialMessage={project.bic_message ?? null}
        updatedAt={project.bic_updated_at ?? null}
      />

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
          annotationsByDeliverable={annotationsByDeliverable}
        />
      </Section>

      {/* Time Tracking */}
      <Section title="Time Tracking">
        <TimeSection
          projectId={project.id}
          initialEntries={(timeEntries as TimeEntry[]) ?? []}
          estimatedHours={project.estimated_hours ?? null}
        />
      </Section>

      {/* Messages */}
      <Section title="Messages">
        <MessagesSection
          projectId={project.id}
          messages={(messages as unknown as Message[]) ?? []}
        />
      </Section>

      {/* Assets */}
      <Section title="Client Assets">
        <AssetsSection projectId={project.id} files={assets} />
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

import { notFound, redirect } from 'next/navigation'
import { FolderOpen, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectStatusBadge } from '@/components/admin/StatusBadge'
import { MilestoneTracker } from '@/components/client/MilestoneTracker'
import { DeliverableCard } from '@/components/client/DeliverableCard'
import { TimeCard } from '@/components/client/TimeCard'
import { AssetDropbox } from '@/components/client/AssetDropbox'
import { ContactForm } from '@/components/client/ContactForm'
import { DeliverableAnnotations } from '@/components/client/DeliverableAnnotations'
import type { Milestone, Deliverable, DriveFolder, TimeEntry, BicStatus, Annotation } from '@/lib/types'

export const metadata = { title: 'My Project — Nuvello Studio' }

// ─── BIC Banner ───────────────────────────────────────────────────────────────

function BicBanner({ status, message }: { status: BicStatus; message: string | null }) {
  if (status === 'client') {
    return (
      <div className="rounded-xl bg-[#EEEDF8] border-l-4 border-[#1E1F6B] p-5 flex items-start gap-4">
        <span className="mt-0.5 w-3 h-3 rounded-full bg-[#1E1F6B] flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-[#1E1F6B]">Your turn</p>
          <p className="text-sm text-[#5A5575] mt-0.5">
            {message ?? 'Nuvello is waiting on you before we can move forward.'}
          </p>
        </div>
      </div>
    )
  }

  if (status === 'clear') {
    return (
      <div className="rounded-xl bg-white border-l-4 border-[#8EECD4] p-5 flex items-start gap-4">
        <svg className="mt-0.5 flex-shrink-0 w-4 h-4 text-[#4BB89E]" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
        <div>
          <p className="text-sm font-semibold text-[#2B2B2E]">All clear</p>
          <p className="text-sm text-[#5A5575] mt-0.5">
            Nothing pending right now. You&apos;re all caught up.
          </p>
        </div>
      </div>
    )
  }

  // admin
  return (
    <div className="rounded-xl bg-[#F8F8FA] border-l-4 border-[#E2E0EB] p-5 flex items-start gap-4">
      <svg className="mt-0.5 flex-shrink-0 w-4 h-4 text-[#9490A8]" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
      </svg>
      <div>
        <p className="text-sm font-semibold text-[#2B2B2E]">We&apos;re on it</p>
        <p className="text-sm text-[#5A5575] mt-0.5">
          {message ?? "Nuvello is working on your project. We'll notify you when something needs your attention."}
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  params: { id: string }
}

export default async function ClientProjectPage({ params }: Props) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()

  const { data: client } = await db
    .from('clients')
    .select('id')
    .eq('client_user_id', user.id)
    .maybeSingle()

  if (!client) notFound()

  const { data: project } = await db
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .eq('client_id', client.id)
    .maybeSingle()

  if (!project) notFound()

  const [
    { data: milestones },
    { data: deliverables },
    { data: driveFolder },
    { data: timeEntries },
  ] = await Promise.all([
    db.from('milestones').select('*').eq('project_id', params.id).order('sort_order'),
    db.from('deliverables').select('*').eq('project_id', params.id).order('created_at'),
    db.from('drive_folders').select('*').eq('project_id', params.id).maybeSingle(),
    db
      .from('time_entries')
      .select('*')
      .eq('project_id', params.id)
      .order('created_at', { ascending: false }),
  ])

  // Batch-fetch annotations for all deliverables in one query
  const deliverableIds = (deliverables ?? []).map((d) => d.id)
  const { data: allAnnotations } = deliverableIds.length > 0
    ? await db.from('annotations').select('*').in('deliverable_id', deliverableIds).order('created_at', { ascending: true })
    : { data: [] as Annotation[] }

  const annotationsByDeliverable: Record<string, Annotation[]> = {}
  for (const ann of allAnnotations ?? []) {
    if (!annotationsByDeliverable[ann.deliverable_id]) annotationsByDeliverable[ann.deliverable_id] = []
    annotationsByDeliverable[ann.deliverable_id].push(ann as Annotation)
  }

  const lastUpdated = new Date(project.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const estimatedHours = project.estimated_hours ? Number(project.estimated_hours) : null

  const bic = (project.bic_status ?? 'admin') as BicStatus

  return (
    <div className="space-y-8">
      {/* BIC Banner */}
      <BicBanner status={bic} message={project.bic_message ?? null} />

      {/* Project header */}
      <div>
        <div className="flex items-center gap-3 flex-wrap mb-2">
          <h1 className="text-2xl font-semibold text-[#2B2B2E]">{project.name}</h1>
          <ProjectStatusBadge status={project.status} />
        </div>

        {project.services && project.services.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {(project.services as string[]).map((s) => (
              <span
                key={s}
                className="px-2.5 py-0.5 rounded-full bg-white border border-[#E2E0EB] text-xs text-[#5A5575]"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        <p className="text-xs text-[#9490A8] mt-3">Started {lastUpdated}</p>
      </div>

      {/* Progress / Milestones */}
      {milestones && milestones.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#2B2B2E] mb-4">Progress</h2>
          <MilestoneTracker milestones={milestones as Milestone[]} />
        </section>
      )}

      {/* Deliverables */}
      {deliverables && deliverables.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-[#2B2B2E] mb-4">Deliverables</h2>
          <div className="space-y-3">
            {(deliverables as Deliverable[]).map((d) => (
              <div key={d.id}>
                <DeliverableCard deliverable={d} projectId={params.id} />
                <DeliverableAnnotations
                  deliverable={d}
                  initialAnnotations={annotationsByDeliverable[d.id] ?? []}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Time tracking — only shown if estimated hours is set */}
      {estimatedHours != null && estimatedHours > 0 && (
        <TimeCard
          entries={(timeEntries as TimeEntry[]) ?? []}
          estimatedHours={estimatedHours}
        />
      )}

      {/* Google Drive folder */}
      {driveFolder && (
        <section>
          <h2 className="text-sm font-semibold text-[#2B2B2E] mb-4">Project Files</h2>
          <div className="bg-white rounded-xl border border-[#E2E0EB] p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EEEDF8] flex items-center justify-center flex-shrink-0">
                <FolderOpen size={18} className="text-[#1E1F6B]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#2B2B2E]">Project Files</p>
                <p className="text-xs text-[#9490A8] mt-0.5">All project assets in one place</p>
              </div>
            </div>
            <a
              href={(driveFolder as DriveFolder).folder_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] transition-colors"
            >
              <ExternalLink size={13} />
              Open in Drive
            </a>
          </div>
        </section>
      )}

      {/* Asset Dropbox */}
      <AssetDropbox projectId={params.id} />

      {/* Contact form */}
      <ContactForm projectId={params.id} />
    </div>
  )
}

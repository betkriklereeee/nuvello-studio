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
import type { Milestone, Deliverable, DriveFolder, TimeEntry } from '@/lib/types'

export const metadata = { title: 'My Project — Nuvello Studio' }

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

  const lastUpdated = new Date(project.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const estimatedHours = project.estimated_hours ? Number(project.estimated_hours) : null

  return (
    <div className="space-y-8">
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
              <DeliverableCard key={d.id} deliverable={d} projectId={params.id} />
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

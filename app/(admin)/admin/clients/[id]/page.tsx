import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProjectStatusBadge } from '@/components/admin/StatusBadge'
import { SendMagicLinkButton } from '@/components/admin/SendMagicLinkButton'

interface Props {
  params: { id: string }
}

export default async function ClientDetailPage({ params }: Props) {
  const db = createAdminClient()

  const { data: client } = await db
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!client) notFound()

  const { data: projects } = await db
    .from('projects')
    .select('*')
    .eq('client_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      {/* Back nav */}
      <Link
        href="/admin/clients"
        className="inline-flex items-center gap-1.5 text-sm text-[#9490A8] hover:text-[#2B2B2E] mb-6 transition-colors"
      >
        <ArrowLeft size={14} />
        All Clients
      </Link>

      {/* Client header */}
      <div className="bg-white rounded-xl border border-[#E2E0EB] p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#2B2B2E]">{client.name}</h1>
            {client.company && (
              <p className="text-sm text-[#5A5575] mt-0.5">{client.company}</p>
            )}
            <p className="text-sm text-[#9490A8] mt-1">{client.email}</p>
            <p className="text-xs text-[#9490A8] mt-3">
              Client since {new Date(client.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <SendMagicLinkButton email={client.email} />
        </div>
      </div>

      {/* Projects */}
      <div className="bg-white rounded-xl border border-[#E2E0EB]">
        <div className="px-6 py-4 border-b border-[#E2E0EB] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#2B2B2E]">
            Projects{' '}
            <span className="ml-1 text-xs font-normal text-[#9490A8]">
              ({projects?.length ?? 0})
            </span>
          </h2>
          <Link
            href={`/admin/projects?client=${params.id}`}
            className="px-3 py-1.5 rounded-lg bg-[#1E1F6B] text-white text-xs font-medium hover:bg-[#16176B] transition-colors"
          >
            + Add Project
          </Link>
        </div>

        {!projects || projects.length === 0 ? (
          <p className="px-6 py-10 text-sm text-center text-[#9490A8]">
            No projects for this client yet.
          </p>
        ) : (
          <div className="divide-y divide-[#E2E0EB]">
            {projects.map((p) => (
              <div key={p.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#2B2B2E]">{p.name}</p>
                  {p.services && p.services.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {p.services.map((s: string) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-full bg-[#F8F8FA] border border-[#E2E0EB] text-xs text-[#5A5575]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <ProjectStatusBadge status={p.status} />
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="p-1.5 rounded-md text-[#9490A8] hover:text-[#1E1F6B] hover:bg-[#EEEDF8] transition-colors"
                    title="Open project"
                  >
                    <ExternalLink size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

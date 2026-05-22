import Link from 'next/link'
import { Users, FolderKanban, FileText, Clock } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { DeliverableStatusBadge } from '@/components/admin/StatusBadge'

export const metadata = { title: 'Dashboard — Nuvello Studio' }

type RecentDeliverable = {
  id: string
  title: string
  status: string
  created_at: string
  projects: { name: string; clients: { name: string } | null } | null
}

export default async function AdminDashboardPage() {
  const db = createAdminClient()

  const [
    { count: clientsCount },
    { count: activeProjectsCount },
    { count: pendingCount },
    { count: revisionCount },
    { data: recent },
  ] = await Promise.all([
    db.from('clients').select('*', { count: 'exact', head: true }),
    db.from('projects').select('*', { count: 'exact', head: true }).neq('status', 'complete'),
    db.from('deliverables').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    db.from('deliverables').select('*', { count: 'exact', head: true }).eq('status', 'revision'),
    db
      .from('deliverables')
      .select('id, title, status, created_at, projects(name, clients(name))')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const stats = [
    { label: 'Total Clients', value: clientsCount ?? 0, icon: Users, href: '/admin/clients' },
    {
      label: 'Active Projects',
      value: activeProjectsCount ?? 0,
      icon: FolderKanban,
      href: '/admin/projects',
    },
    {
      label: 'Pending Deliverables',
      value: pendingCount ?? 0,
      icon: FileText,
      href: '/admin/projects',
    },
    {
      label: 'Awaiting Approval',
      value: revisionCount ?? 0,
      icon: Clock,
      href: '/admin/projects',
    },
  ]

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold text-[#2B2B2E]">Dashboard</h1>
        <div className="flex gap-3">
          <Link
            href="/admin/clients"
            className="px-4 py-2 rounded-lg border border-[#E2E0EB] bg-white text-sm font-medium text-[#5A5575] hover:bg-[#F8F8FA] transition-colors"
          >
            + Add Client
          </Link>
          <Link
            href="/admin/projects"
            className="px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] transition-colors"
          >
            + Add Project
          </Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-white rounded-xl border border-[#E2E0EB] p-5 hover:shadow-sm transition-shadow group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[#9490A8] mb-1">{label}</p>
                <p className="text-3xl font-semibold text-[#2B2B2E]">{value}</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#EEEDF8] flex items-center justify-center group-hover:bg-[#C5C4E0] transition-colors">
                <Icon size={18} className="text-[#1E1F6B]" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-[#E2E0EB]">
        <div className="px-6 py-4 border-b border-[#E2E0EB] flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[#2B2B2E]">Recent Activity</h2>
          <Link
            href="/admin/projects"
            className="text-xs text-[#1E1F6B] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-[#E2E0EB]">
          {!recent || recent.length === 0 ? (
            <p className="px-6 py-10 text-sm text-center text-[#9490A8]">
              No deliverables yet.
            </p>
          ) : (
            (recent as unknown as RecentDeliverable[]).map((d) => (
              <div key={d.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#2B2B2E]">{d.title}</p>
                  <p className="text-xs text-[#9490A8] mt-0.5">
                    {d.projects?.clients?.name} &middot;{' '}
                    {d.projects?.name}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <DeliverableStatusBadge status={d.status} />
                  <span className="text-xs text-[#9490A8]">
                    {new Date(d.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

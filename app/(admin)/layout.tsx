import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()
  const [{ count: clientsCount }, { count: projectsCount }] = await Promise.all([
    db.from('clients').select('*', { count: 'exact', head: true }),
    db.from('projects').select('*', { count: 'exact', head: true }),
  ])

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F8FA]">
      <Sidebar
        userEmail={user.email ?? ''}
        clientsCount={clientsCount ?? 0}
        projectsCount={projectsCount ?? 0}
      />
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  )
}

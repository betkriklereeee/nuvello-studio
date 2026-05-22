import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { Sidebar } from '@/components/admin/Sidebar'
import { AdminShell } from '@/components/admin/AdminShell'

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
    <AdminShell
      sidebar={
        <Sidebar
          userEmail={user.email ?? ''}
          clientsCount={clientsCount ?? 0}
          projectsCount={projectsCount ?? 0}
        />
      }
    >
      {children}
    </AdminShell>
  )
}

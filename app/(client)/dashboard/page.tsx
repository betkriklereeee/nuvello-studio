import Image from 'next/image'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Image
        src="/logo.png"
        alt="Nuvello Web"
        width={160}
        height={48}
        className="h-auto mb-8"
      />
      <p className="text-[#9490A8] max-w-sm leading-relaxed">
        Your project hasn&apos;t been set up yet.
        <br />
        We&apos;ll notify you when it&apos;s ready.
      </p>
    </div>
  )
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const db = createAdminClient()

  // Identify client record by the authenticated user's ID
  const { data: client } = await db
    .from('clients')
    .select('id')
    .eq('client_user_id', user.id)
    .maybeSingle()

  if (!client) return <EmptyState />

  // Most recent active project
  const { data: project } = await db
    .from('projects')
    .select('id')
    .eq('client_id', client.id)
    .neq('status', 'complete')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!project) return <EmptyState />

  redirect(`/dashboard/projects/${project.id}`)
}

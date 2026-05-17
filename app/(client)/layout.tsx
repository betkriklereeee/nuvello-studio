import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/client/TopNav'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name ?? user.email ?? ''

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <TopNav displayName={displayName} />
      <div className="max-w-[900px] mx-auto px-6 py-10">{children}</div>
    </div>
  )
}

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TopNav } from '@/components/client/TopNav'
import { OnboardingModal } from '@/components/client/OnboardingModal'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, onboarded')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name ?? user.email ?? ''
  const onboarded = profile?.onboarded ?? false

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <OnboardingModal onboarded={onboarded} />
      <TopNav displayName={displayName} />
      <div className="max-w-[900px] mx-auto px-6 py-10">{children}</div>
    </div>
  )
}

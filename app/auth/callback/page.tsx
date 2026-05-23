'use client'

import { Suspense, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

async function resolveDestination(supabase: ReturnType<typeof createClient>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return '/login?error=auth_callback'
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'admin' ? '/admin' : '/dashboard'
}

function Spinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-[#1E1F6B] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#9490A8]">Signing you in…</p>
      </div>
    </div>
  )
}

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = createClient()

    async function handle() {
      // Case 1: hash fragment — magic link, OTP, or password recovery
      const hash = window.location.hash.slice(1) // strip leading #
      if (hash) {
        const hashParams = new URLSearchParams(hash)
        const access_token = hashParams.get('access_token')
        const refresh_token = hashParams.get('refresh_token')
        const type = hashParams.get('type')

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) { router.replace('/login?error=auth_callback'); return }

          // Check type=recovery BEFORE resolving the normal destination
          if (type === 'recovery') {
            router.push('/auth/reset-password')
            return
          }

          router.replace(await resolveDestination(supabase))
          return
        }
      }

      // Case 2: PKCE code exchange (OAuth / some email flows)
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { router.replace('/login?error=auth_callback'); return }
        router.replace(await resolveDestination(supabase))
        return
      }

      // Nothing usable — bail out
      router.replace('/login?error=auth_callback')
    }

    handle()
  }, [router, searchParams])

  return <Spinner />
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CallbackHandler />
    </Suspense>
  )
}

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

    // Supabase fires PASSWORD_RECOVERY before SIGNED_IN for recovery links.
    // Subscribe first so we never miss it regardless of which flow runs.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        subscription.unsubscribe()
        router.replace('/auth/reset-password')
      }
    })

    async function handle() {
      // Case 1: hash fragment — Supabase magic link / email OTP / recovery
      const hash = window.location.hash.slice(1) // strip leading #
      if (hash) {
        const params = new URLSearchParams(hash)
        const access_token = params.get('access_token')
        const refresh_token = params.get('refresh_token')
        const type = params.get('type')

        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) { subscription.unsubscribe(); router.replace('/login?error=auth_callback'); return }
          // setSession won't fire onAuthStateChange with PASSWORD_RECOVERY,
          // so we handle it explicitly from the hash type param.
          if (type === 'recovery') { subscription.unsubscribe(); router.replace('/auth/reset-password'); return }
          subscription.unsubscribe()
          router.replace(await resolveDestination(supabase))
          return
        }
      }

      // Case 2: PKCE code exchange — Supabase fires PASSWORD_RECOVERY via
      // onAuthStateChange above when this is a recovery link, so we just
      // exchange and let the subscription handle the redirect.
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) { subscription.unsubscribe(); router.replace('/login?error=auth_callback'); return }
        // If PASSWORD_RECOVERY fires, the subscription redirects; otherwise fall through.
        // Give it one tick, then resolve normally.
        await new Promise((r) => setTimeout(r, 0))
        // If already navigating to reset-password the subscription handled it; guard here.
        subscription.unsubscribe()
        router.replace(await resolveDestination(supabase))
        return
      }

      // No token or code — nothing to do
      subscription.unsubscribe()
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

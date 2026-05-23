'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Recovery links land here with a hash fragment the server never sees.
    // Check BEFORE any session/auth work so the token isn't consumed.
    const hash = window.location.hash
    if (hash && new URLSearchParams(hash.slice(1)).get('type') === 'recovery') {
      window.location.replace('/auth/reset-password' + hash)
      return
    }

    async function redirect() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.replace('/login'); return }
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      router.replace(profile?.role === 'admin' ? '/admin' : '/dashboard')
    }

    redirect()
  }, [router])

  // Blank while resolving — the redirect is immediate
  return null
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Stage = 'loading' | 'ready' | 'submitting' | 'done' | 'error'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('loading')
  const [initError, setInitError] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [formError, setFormError] = useState('')

  // On mount: extract tokens from hash and establish a session so
  // supabase.auth.updateUser() works without a prior login.
  useEffect(() => {
    async function init() {
      const hash = window.location.hash.slice(1) // strip leading #
      const params = new URLSearchParams(hash)
      const access_token  = params.get('access_token')
      const refresh_token = params.get('refresh_token')
      const errorCode     = params.get('error_code')
      const hashError     = params.get('error')

      if (hashError === 'access_denied' || errorCode === 'otp_expired') {
        router.replace('/login?error=link_expired')
        return
      }

      if (access_token && refresh_token) {
        const supabase = createClient()
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) {
          setInitError('This link is invalid or has already been used.')
          setStage('error')
          return
        }
        // Clear the hash so the tokens aren't reused on reload
        history.replaceState(null, '', window.location.pathname)
        setStage('ready')
        return
      }

      // No tokens in hash — check if there's an active session already
      // (e.g. user navigated here directly after callback handled the exchange)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setStage('ready')
      } else {
        router.replace('/login?error=link_expired')
      }
    }

    init()
  }, [router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError('')

    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setFormError('Passwords do not match.')
      return
    }

    setStage('submitting')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setFormError(error.message)
      setStage('ready')
      return
    }

    setStage('done')
    setTimeout(() => router.replace('/admin'), 2000)
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (stage === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA]">
        <div className="w-8 h-8 border-2 border-[#1E1F6B] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // ── Invalid / expired link ────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA] px-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E0EB] shadow-sm p-8 text-center space-y-3">
          <p className="text-2xl">🔗</p>
          <p className="text-[#2B2B2E] font-semibold">Link unavailable</p>
          <p className="text-sm text-[#5A5575]">{initError}</p>
          <button
            onClick={() => router.replace('/login')}
            className="mt-2 px-5 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    )
  }

  // ── Main form + success ───────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA] px-4">
      <div className="w-full max-w-md">

        <p className="text-center text-[#1E1F6B] font-bold text-xl tracking-tight mb-8">
          nuvello.studio
        </p>

        <div className="bg-white rounded-2xl border border-[#E2E0EB] shadow-sm overflow-hidden">

          <div className="bg-[#1E1F6B] px-8 py-6">
            <h1 className="text-white text-lg font-semibold">Set a new password</h1>
            <p className="text-[#C5C4E0] text-sm mt-1">Choose something strong you&apos;ll remember.</p>
          </div>

          <div className="px-8 py-8">
            {stage === 'done' ? (
              <div className="text-center space-y-3 py-4">
                <div className="text-4xl">✓</div>
                <p className="text-[#2B2B2E] font-semibold text-base">Password updated!</p>
                <p className="text-[#5A5575] text-sm">Taking you to your dashboard…</p>
                <div className="w-6 h-6 border-2 border-[#1E1F6B] border-t-transparent rounded-full animate-spin mx-auto mt-2" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-[#2B2B2E] mb-1.5">
                    New password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-[#F8F8FA]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#2B2B2E] mb-1.5">
                    Confirm password
                  </label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Re-enter your password"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-[#F8F8FA]"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-[#B33A3A]">{formError}</p>
                )}

                <button
                  type="submit"
                  disabled={stage === 'submitting'}
                  className="w-full py-2.5 rounded-lg bg-[#1E1F6B] text-white text-sm font-semibold hover:bg-[#16176B] disabled:opacity-60 transition-colors"
                >
                  {stage === 'submitting' ? 'Updating…' : 'Set Password'}
                </button>
              </form>
            )}
          </div>

        </div>

        <p className="text-center text-xs text-[#9490A8] mt-6">
          Nuvello Studio &middot; studio.nuvelloweb.com
        </p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setState('loading')
    const supabase = createClient()

    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setState('idle')
      return
    }

    setState('done')

    // Look up role to decide where to send the user
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = user
      ? await supabase.from('profiles').select('role').eq('id', user.id).single()
      : { data: null }

    const destination = profile?.role === 'admin' ? '/admin' : '/dashboard'

    // Brief pause so the success message is visible before navigating
    setTimeout(() => router.replace(destination), 2000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F8FA] px-4">
      <div className="w-full max-w-md">

        {/* Brand wordmark */}
        <p className="text-center text-[#1E1F6B] font-bold text-xl tracking-tight mb-8">
          nuvello.studio
        </p>

        <div className="bg-white rounded-2xl border border-[#E2E0EB] shadow-sm overflow-hidden">

          {/* Header bar */}
          <div className="bg-[#1E1F6B] px-8 py-6">
            <h1 className="text-white text-lg font-semibold">Set a new password</h1>
            <p className="text-[#C5C4E0] text-sm mt-1">Choose something strong you&apos;ll remember.</p>
          </div>

          <div className="px-8 py-8">
            {state === 'done' ? (
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

                {error && (
                  <p className="text-xs text-[#B33A3A]">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={state === 'loading'}
                  className="w-full py-2.5 rounded-lg bg-[#1E1F6B] text-white text-sm font-semibold hover:bg-[#16176B] disabled:opacity-60 transition-colors"
                >
                  {state === 'loading' ? 'Updating…' : 'Set Password'}
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

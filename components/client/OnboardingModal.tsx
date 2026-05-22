'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { updateOnboarded } from '@/lib/actions'

export function OnboardingModal({ onboarded }: { onboarded: boolean }) {
  const [visible, setVisible] = useState(!onboarded)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')

  if (!visible) return null

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

    await updateOnboarded()
    setState('done')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#E2E0EB] shadow-xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt="Nuvello Studio" height={40} width={160} style={{ height: 40, width: 'auto' }} />
        </div>

        {state === 'done' ? (
          <div className="text-center space-y-3">
            <div className="text-3xl">🎉</div>
            <h2 className="text-xl font-semibold text-[#2B2B2E]">You&apos;re all set!</h2>
            <p className="text-sm text-[#5A5575]">
              Use your email and password to log in next time.
            </p>
            <button
              onClick={() => setVisible(false)}
              className="mt-4 px-6 py-2.5 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-[#2B2B2E] text-center mb-1">
              Welcome to Nuvello Studio
            </h2>
            <p className="text-sm text-[#5A5575] text-center mb-6">
              Set a password so you can log in anytime without needing a link.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#2B2B2E] mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full px-3 py-2.5 rounded-lg border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-[#F8F8FA]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#2B2B2E] mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  placeholder="Re-enter your password"
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
                {state === 'loading' ? 'Setting password…' : 'Set Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

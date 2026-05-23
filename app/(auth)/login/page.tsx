'use client'

import { Suspense, useState } from 'react'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab = 'magic' | 'password'

const inputClass =
  'w-full px-4 py-2.5 rounded-md border border-[#E2E0EB] bg-white text-[#2B2B2E] ' +
  'placeholder-[#9490A8] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] ' +
  'transition-shadow'

const btnClass =
  'w-full py-2.5 px-4 rounded-md bg-[#1E1F6B] hover:bg-[#16176B] text-white text-sm ' +
  'font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed'

function LoginForm() {
  const searchParams = useSearchParams()
  const linkExpired = searchParams.get('error') === 'link_expired'

  const [tab, setTab] = useState<Tab>('magic')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  function switchTab(next: Tab) {
    setTab(next)
    setError('')
    setMagicSent(false)
  }

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setMagicSent(true)
    }
  }

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    router.push(profile?.role === 'admin' ? '/admin' : '/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-[#F8F8FA] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-[#E2E0EB] shadow-sm p-10">
        {/* Logo + tagline */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src="/logo.png"
            alt="Nuvello Web"
            width={200}
            height={60}
            priority
            className="h-auto"
          />
          <p className="mt-3 text-sm text-[#9490A8]">Your project hub.</p>
        </div>

        {/* Expired link banner */}
        {linkExpired && (
          <div className="mb-5 px-4 py-3 rounded-lg bg-[#FFF8F8] border border-[#F5C6C6] text-sm text-[#B33A3A]">
            Your reset link has expired. Please request a new one.
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-[#E2E0EB] mb-6">
          {(['magic', 'password'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={[
                'pb-3 mr-6 text-sm font-medium transition-colors',
                tab === t
                  ? 'text-[#1E1F6B] border-b-2 border-[#1E1F6B] -mb-px'
                  : 'text-[#9490A8] hover:text-[#5A5575]',
              ].join(' ')}
            >
              {t === 'magic' ? 'Magic Link' : 'Password'}
            </button>
          ))}
        </div>

        {/* Magic Link */}
        {tab === 'magic' &&
          (magicSent ? (
            <div className="flex flex-col items-center py-6 text-center">
              <div className="w-12 h-12 rounded-full bg-[#EEEDF8] flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-[#1E1F6B]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <p className="text-[#2B2B2E] font-medium">Check your inbox.</p>
              <p className="mt-1 text-sm text-[#9490A8]">
                We sent a magic link to {email}
              </p>
            </div>
          ) : (
            <form onSubmit={handleMagicLink} className="space-y-4">
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className={inputClass}
              />
              {error && (
                <p className="text-xs text-[#B33A3A] -mt-1">{error}</p>
              )}
              <button type="submit" disabled={loading} className={btnClass}>
                {loading ? 'Sending…' : 'Send Magic Link'}
              </button>
            </form>
          ))}

        {/* Password */}
        {tab === 'password' && (
          <form onSubmit={handlePassword} className="space-y-4">
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={inputClass}
            />
            {error && (
              <p className="text-xs text-[#B33A3A] -mt-1">{error}</p>
            )}
            <button type="submit" disabled={loading} className={btnClass}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  )
}

'use client'

import { useState } from 'react'
import { sendPasswordReset } from '@/lib/actions'

export function SendPasswordResetButton({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleClick() {
    setState('loading')
    const result = await sendPasswordReset(email)
    if (result.error) {
      setErrorMsg(result.error)
      setState('error')
    } else {
      setState('done')
    }
  }

  if (state === 'done') {
    return (
      <p className="text-xs text-green-700 font-medium">✓ Reset email sent to {email}</p>
    )
  }

  if (state === 'error') {
    return (
      <div className="text-right">
        <p className="text-xs text-[#B33A3A] mb-1">{errorMsg}</p>
        <button
          onClick={() => setState('idle')}
          className="text-xs text-[#9490A8] hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className="px-3 py-1.5 rounded-lg border border-[#E2E0EB] text-xs font-medium text-[#5A5575] hover:text-[#2B2B2E] hover:border-[#C5C4E0] disabled:opacity-60 transition-colors"
    >
      {state === 'loading' ? 'Sending…' : 'Send Password Reset'}
    </button>
  )
}

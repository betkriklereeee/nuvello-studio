'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'
import { sendClientMagicLink } from '@/lib/actions'

export function SendMagicLinkButton({ email, clientName }: { email: string; clientName: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSend() {
    setState('loading')
    const result = await sendClientMagicLink(email, clientName)
    if (result.error) {
      setErrorMsg(result.error)
      setState('error')
    } else {
      setState('done')
    }
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={state === 'loading' || state === 'done'}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E2E0EB] bg-white text-sm font-medium text-[#5A5575] hover:bg-[#F8F8FA] disabled:opacity-60 transition-colors"
      >
        <Send size={14} />
        {state === 'loading' ? 'Sending…' : state === 'done' ? 'Invite Sent' : 'Send Magic Link'}
      </button>

      {state === 'done' && (
        <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
          <CheckCircle size={15} className="flex-shrink-0" />
          Invite sent to {email}
        </div>
      )}

      {state === 'error' && (
        <p className="mt-2 text-xs text-[#B33A3A]">{errorMsg}</p>
      )}
    </div>
  )
}

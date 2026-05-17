'use client'

import { useState } from 'react'
import { Send, Check, Copy } from 'lucide-react'
import { sendClientMagicLink } from '@/lib/actions'

export function SendMagicLinkButton({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [link, setLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSend() {
    setState('loading')
    const result = await sendClientMagicLink(email)
    if (result.error) {
      setErrorMsg(result.error)
      setState('error')
    } else {
      setLink(result.link ?? null)
      setState('done')
    }
  }

  async function copyLink() {
    if (!link) return
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <button
        onClick={handleSend}
        disabled={state === 'loading' || state === 'done'}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#E2E0EB] bg-white text-sm font-medium text-[#5A5575] hover:bg-[#F8F8FA] disabled:opacity-60 transition-colors"
      >
        <Send size={14} />
        {state === 'loading' ? 'Generating…' : 'Send Magic Link'}
      </button>

      {state === 'done' && link && (
        <div className="mt-3 p-4 rounded-lg bg-[#EEEDF8] border border-[#C5C4E0] max-w-full overflow-hidden">
          <p className="text-xs font-medium text-[#1E1F6B] mb-2">
            Magic link generated — share with the client:
          </p>
          <div className="flex items-center gap-2 min-w-0">
            <code className="flex-1 min-w-0 text-xs text-[#5A5575] bg-white border border-[#E2E0EB] rounded px-3 py-2 break-all">
              {link}
            </code>
            <button
              onClick={copyLink}
              className="flex-shrink-0 p-2 rounded-md bg-white border border-[#E2E0EB] text-[#5A5575] hover:text-[#1E1F6B] transition-colors"
              title="Copy link"
            >
              {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
            </button>
          </div>
          <p className="text-xs text-[#9490A8] mt-2">Link expires after first use.</p>
        </div>
      )}

      {state === 'error' && (
        <p className="mt-2 text-xs text-[#B33A3A]">{errorMsg}</p>
      )}
    </div>
  )
}

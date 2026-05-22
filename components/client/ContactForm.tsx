'use client'

import { useState } from 'react'
import { sendMessage } from '@/lib/client-actions'

export function ContactForm({ projectId }: { projectId: string }) {
  const [message, setMessage] = useState('')
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim()) return
    setState('loading')
    const result = await sendMessage(projectId, message.trim())
    if (result.error) {
      setErrorMsg(result.error)
      setState('error')
    } else {
      setMessage('')
      setState('done')
    }
  }

  if (state === 'done') {
    return (
      <section>
        <h2 className="text-sm font-semibold text-[#2B2B2E] mb-4">Have a question?</h2>
        <div className="bg-white rounded-xl border border-[#E2E0EB] p-5 text-center space-y-2">
          <p className="text-sm font-medium text-green-700">✓ Message sent!</p>
          <p className="text-xs text-[#9490A8]">We&apos;ll get back to you shortly.</p>
          <button
            onClick={() => setState('idle')}
            className="text-xs text-[#1E1F6B] hover:underline"
          >
            Send another message
          </button>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-[#2B2B2E] mb-4">Have a question?</h2>
      <div className="bg-white rounded-xl border border-[#E2E0EB] p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Your message…"
            rows={4}
            required
            className="w-full px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] resize-none"
          />
          {state === 'error' && (
            <p className="text-xs text-[#B33A3A]">{errorMsg}</p>
          )}
          <button
            type="submit"
            disabled={state === 'loading' || !message.trim()}
            className="w-full py-2.5 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60 transition-colors"
          >
            {state === 'loading' ? 'Sending…' : 'Send Message'}
          </button>
        </form>
      </div>
    </section>
  )
}

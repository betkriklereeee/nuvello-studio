'use client'

import { useState } from 'react'
import { updateBicStatus } from '@/lib/actions'
import type { BicStatus } from '@/lib/types'

const OPTIONS: { value: BicStatus; label: string }[] = [
  { value: 'client', label: "Client's turn" },
  { value: 'admin',  label: "We're on it"  },
  { value: 'clear',  label: 'All clear'    },
]

interface Props {
  projectId: string
  initialStatus: BicStatus
  initialMessage: string | null
  updatedAt: string | null
}

export function BicPanel({ projectId, initialStatus, initialMessage, updatedAt }: Props) {
  const [status, setStatus]   = useState<BicStatus>(initialStatus)
  const [message, setMessage] = useState(initialMessage ?? '')
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    setError('')
    const result = await updateBicStatus(projectId, status, message.trim() || null)
    setSaving(false)
    if (result.error) {
      setError(result.error)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-[#E2E0EB] p-6 space-y-4">
      <h2 className="text-sm font-semibold text-[#2B2B2E]">Ball in Your Court</h2>

      {/* Toggle buttons */}
      <div className="flex gap-2 flex-wrap">
        {OPTIONS.map((opt) => {
          const active = status === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-[#EEEDF8] text-[#1E1F6B]'
                  : 'bg-[#F8F8FA] text-[#5A5575] hover:bg-[#EEEDF8] hover:text-[#1E1F6B]',
              ].join(' ')}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Context message */}
      <div>
        <label className="block text-xs font-medium text-[#5A5575] mb-1.5">
          Context message{' '}
          <span className="font-normal text-[#9490A8]">(shown to client, optional)</span>
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 120))}
          placeholder="E.g. Please review the homepage design and leave feedback."
          className="w-full px-3 py-2 rounded-lg border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-[#F8F8FA]"
        />
        <p className="text-xs text-[#9490A8] mt-1 text-right">{message.length}/120</p>
      </div>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60 transition-colors"
        >
          {saving ? 'Saving…' : 'Update Status'}
        </button>
        {saved && <span className="text-xs text-green-700">✓ Saved</span>}
        {error && <span className="text-xs text-[#B33A3A]">{error}</span>}
      </div>

      {updatedAt && (
        <p className="text-xs text-[#9490A8]">
          Last updated {new Date(updatedAt).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
          })}{' '}at{' '}
          {new Date(updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  )
}

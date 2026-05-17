'use client'

import { useState, useTransition } from 'react'
import { Check, RotateCcw } from 'lucide-react'
import { DeliverableStatusBadge } from '@/components/admin/StatusBadge'
import { approveDeliverable, requestRevision } from '@/lib/client-actions'
import type { Deliverable } from '@/lib/types'

export function DeliverableCard({
  deliverable: initial,
  projectId,
}: {
  deliverable: Deliverable
  projectId: string
}) {
  const [deliverable, setDeliverable] = useState(initial)
  const [showRevision, setShowRevision] = useState(false)
  const [notes, setNotes] = useState(initial.revision_notes ?? '')
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    setDeliverable((d) => ({ ...d, status: 'approved' }))
    startTransition(() => {
      approveDeliverable(deliverable.id, projectId)
    })
  }

  function handleRevisionSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = notes.trim()
    setDeliverable((d) => ({ ...d, status: 'revision', revision_notes: trimmed }))
    setShowRevision(false)
    startTransition(() => {
      requestRevision(deliverable.id, projectId, trimmed)
    })
  }

  const canAct = deliverable.status === 'pending' || deliverable.status === 'revision'

  return (
    <div className="bg-white rounded-xl border border-[#E2E0EB] p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#2B2B2E]">{deliverable.title}</p>
          {deliverable.status === 'revision' && deliverable.revision_notes && (
            <p className="text-xs text-[#9490A8] mt-1 italic leading-relaxed">
              &ldquo;{deliverable.revision_notes}&rdquo;
            </p>
          )}
          <p className="text-xs text-[#9490A8] mt-1.5">
            Added{' '}
            {new Date(deliverable.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <DeliverableStatusBadge status={deliverable.status} />
      </div>

      {/* Action buttons — shown for pending or revision, hidden once approved */}
      {canAct && !showRevision && (
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E2E0EB]">
          <button
            onClick={handleApprove}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8EECD4]/20 text-green-700 text-sm font-medium hover:bg-[#8EECD4]/40 disabled:opacity-60 transition-colors"
          >
            <Check size={13} strokeWidth={2.5} />
            Approve
          </button>
          <button
            onClick={() => setShowRevision(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E0EB] text-sm font-medium text-[#5A5575] hover:bg-[#F8F8FA] transition-colors"
          >
            <RotateCcw size={13} />
            Request Revision
          </button>
        </div>
      )}

      {/* Revision form */}
      {showRevision && (
        <form onSubmit={handleRevisionSubmit} className="mt-4 pt-4 border-t border-[#E2E0EB] space-y-3">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what changes you'd like…"
            rows={3}
            autoFocus
            className="w-full px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] resize-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60 transition-colors"
            >
              {isPending ? 'Submitting…' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={() => { setShowRevision(false); setNotes(deliverable.revision_notes ?? '') }}
              className="px-4 py-1.5 rounded-lg border border-[#E2E0EB] text-sm text-[#5A5575] hover:bg-[#F8F8FA] transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

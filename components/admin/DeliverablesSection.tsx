'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, Trash2, Plus, ChevronDown } from 'lucide-react'
import { addDeliverable, setDeliverableStatus, removeDeliverable } from '@/lib/actions'
import { DeliverableStatusBadge } from './StatusBadge'
import type { Deliverable, DeliverableStatus } from '@/lib/types'

const STATUSES: DeliverableStatus[] = ['pending', 'approved', 'revision']

const inputCls =
  'w-full px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] ' +
  'placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-white'

export function DeliverablesSection({
  projectId,
  initialDeliverables,
}: {
  projectId: string
  initialDeliverables: Deliverable[]
}) {
  const [deliverables, setDeliverables] = useState(initialDeliverables)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await addDeliverable({
      project_id: projectId,
      title: title.trim(),
      file_url: fileUrl.trim() || null,
    })
    setTitle('')
    setFileUrl('')
    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  async function handleStatusChange(id: string, status: string) {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: status as DeliverableStatus } : d))
    ) // optimistic
    await setDeliverableStatus(id, status, projectId)
  }

  async function handleDelete(id: string) {
    setDeliverables((prev) => prev.filter((d) => d.id !== id)) // optimistic
    await removeDeliverable(id, projectId)
    router.refresh()
  }

  return (
    <div className="space-y-2">
      {deliverables.length === 0 && !showForm && (
        <p className="py-4 text-sm text-center text-[#9490A8]">No deliverables yet.</p>
      )}

      {deliverables.map((d) => (
        <div
          key={d.id}
          className="flex items-start gap-3 px-4 py-3 rounded-lg border border-[#E2E0EB] bg-white"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[#2B2B2E]">{d.title}</p>
            {d.revision_notes && (
              <p className="text-xs text-[#9490A8] mt-0.5 italic">
                Note: {d.revision_notes}
              </p>
            )}
            {d.file_url && (
              <a
                href={d.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-[#1E1F6B] hover:underline mt-1"
              >
                <ExternalLink size={11} />
                View file
              </a>
            )}
          </div>

          {/* Status selector */}
          <div className="flex-shrink-0 relative">
            <div className="flex items-center gap-1">
              <DeliverableStatusBadge status={d.status} />
              <div className="relative">
                <select
                  value={d.status}
                  onChange={(e) => handleStatusChange(d.id, e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  aria-label="Change status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} className="text-[#9490A8]" />
              </div>
            </div>
          </div>

          <button
            onClick={() => handleDelete(d.id)}
            className="flex-shrink-0 p-1 rounded text-[#C5C4E0] hover:text-[#B33A3A] transition-colors"
            title="Delete deliverable"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {/* Add form */}
      {showForm ? (
        <form onSubmit={handleAdd} className="space-y-3 pt-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Deliverable title…"
            autoFocus
            required
            className={inputCls}
          />
          <input
            value={fileUrl}
            onChange={(e) => setFileUrl(e.target.value)}
            placeholder="Google Drive link (optional)"
            className={inputCls}
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60"
            >
              {loading ? 'Adding…' : 'Add Deliverable'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setTitle(''); setFileUrl('') }}
              className="px-4 py-2 rounded-lg border border-[#E2E0EB] text-sm text-[#5A5575] hover:bg-[#F8F8FA]"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 text-sm text-[#9490A8] hover:text-[#1E1F6B] transition-colors"
        >
          <Plus size={14} />
          Add Deliverable
        </button>
      )}
    </div>
  )
}

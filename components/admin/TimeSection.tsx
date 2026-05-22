'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, Clock } from 'lucide-react'
import { addTimeEntry, removeTimeEntry } from '@/lib/actions'
import type { TimeEntry } from '@/lib/types'

const inputCls =
  'px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] ' +
  'placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] bg-white'

export function TimeSection({
  projectId,
  initialEntries,
  estimatedHours,
}: {
  projectId: string
  initialEntries: TimeEntry[]
  estimatedHours: number | null
}) {
  const [entries, setEntries] = useState(initialEntries)
  const [hours, setHours] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const totalLogged = entries.reduce((sum, e) => sum + Number(e.hours), 0)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const h = Number(hours)
    if (!h || h <= 0) return
    setLoading(true)
    await addTimeEntry({ project_id: projectId, hours: h, description: description.trim() })
    setHours('')
    setDescription('')
    setLoading(false)
    router.refresh()
  }

  async function handleDelete(id: string) {
    setEntries((prev) => prev.filter((e) => e.id !== id))
    await removeTimeEntry(id, projectId)
  }

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex items-center gap-6 p-4 rounded-xl bg-[#F8F8FA] border border-[#E2E0EB]">
        <div className="text-center">
          <p className="text-2xl font-semibold text-[#2B2B2E]">{totalLogged.toFixed(1)}</p>
          <p className="text-xs text-[#9490A8] mt-0.5">hrs logged</p>
        </div>
        {estimatedHours != null && estimatedHours > 0 && (
          <>
            <div className="h-8 w-px bg-[#E2E0EB]" />
            <div className="text-center">
              <p className="text-2xl font-semibold text-[#9490A8]">{estimatedHours}</p>
              <p className="text-xs text-[#9490A8] mt-0.5">hrs estimated</p>
            </div>
            <div className="flex-1 min-w-[80px]">
              <div className="h-2 rounded-full bg-[#E2E0EB] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#1E1F6B] transition-all"
                  style={{ width: `${Math.min(100, (totalLogged / estimatedHours) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-[#9490A8] mt-1">
                {Math.round(Math.min(100, (totalLogged / estimatedHours) * 100))}% used
              </p>
            </div>
          </>
        )}
      </div>

      {/* Log form */}
      <form onSubmit={handleAdd} className="flex gap-2 flex-wrap">
        <input
          type="number"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          placeholder="Hours"
          min="0.25"
          step="0.25"
          required
          className={`${inputCls} w-24 flex-shrink-0`}
        />
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className={`${inputCls} flex-1 min-w-[140px]`}
        />
        <button
          type="submit"
          disabled={loading || !hours}
          className="px-4 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60 flex-shrink-0 transition-colors"
        >
          {loading ? 'Adding…' : 'Log Time'}
        </button>
      </form>

      {/* Entry list */}
      {entries.length === 0 ? (
        <div className="py-8 flex flex-col items-center gap-2 text-center">
          <Clock size={24} className="text-[#C5C4E0]" />
          <p className="text-sm text-[#9490A8]">No time logged yet.</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#E2E0EB] bg-white"
            >
              <span className="text-sm font-semibold text-[#1E1F6B] w-12 flex-shrink-0">
                {Number(entry.hours).toFixed(1)}h
              </span>
              <span className="flex-1 text-sm text-[#5A5575] truncate">
                {entry.description || <span className="text-[#C5C4E0]">—</span>}
              </span>
              <span className="text-xs text-[#9490A8] flex-shrink-0">
                {new Date(entry.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                })}
              </span>
              <button
                onClick={() => handleDelete(entry.id)}
                className="p-1 rounded text-[#C5C4E0] hover:text-[#B33A3A] transition-colors"
                title="Remove entry"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

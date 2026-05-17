'use client'

import { useState, useTransition } from 'react'
import { setProjectStatus } from '@/lib/actions'
import type { ProjectStatus } from '@/lib/types'

const STATUSES: ProjectStatus[] = ['discovery', 'design', 'build', 'launch', 'complete']

export function ProjectStatusUpdater({
  projectId,
  currentStatus,
}: {
  projectId: string
  currentStatus: ProjectStatus
}) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as ProjectStatus
    setStatus(next) // optimistic
    startTransition(() => {
      setProjectStatus(projectId, next)
    })
  }

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={isPending}
      className="px-3 py-1.5 rounded-lg border border-[#E2E0EB] bg-white text-sm text-[#2B2B2E] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] disabled:opacity-60 capitalize"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="capitalize">
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </option>
      ))}
    </select>
  )
}

import type { TimeEntry } from '@/lib/types'

export function TimeCard({
  entries,
  estimatedHours,
}: {
  entries: TimeEntry[]
  estimatedHours: number
}) {
  const totalLogged = entries.reduce((sum, e) => sum + Number(e.hours), 0)
  const pct = Math.min(100, (totalLogged / estimatedHours) * 100)

  return (
    <section>
      <h2 className="text-sm font-semibold text-[#2B2B2E] mb-4">Time</h2>
      <div className="bg-white rounded-xl border border-[#E2E0EB] p-5">
        <div className="flex items-baseline justify-between mb-3">
          <p className="text-sm text-[#2B2B2E]">
            <span className="font-semibold text-base">{totalLogged.toFixed(1)}</span>
            {' of '}
            <span>{estimatedHours}</span>
            {' hours used'}
          </p>
          <span className="text-xs font-medium text-[#9490A8]">{Math.round(pct)}%</span>
        </div>
        <div className="h-2.5 rounded-full bg-[#E2E0EB] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#1E1F6B] transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="text-xs text-[#9490A8] mt-2">
          {totalLogged.toFixed(1)} hrs logged · {estimatedHours} hrs estimated
        </p>
      </div>
    </section>
  )
}

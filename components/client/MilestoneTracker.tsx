import { Check } from 'lucide-react'
import type { Milestone, MilestoneStatus } from '@/lib/types'

function StatusDot({ status }: { status: MilestoneStatus }) {
  if (status === 'complete') {
    return (
      <div className="w-7 h-7 rounded-full bg-[#1E1F6B] flex items-center justify-center flex-shrink-0">
        <Check size={13} strokeWidth={2.5} className="text-white" />
      </div>
    )
  }
  if (status === 'in_progress') {
    return (
      <div className="w-7 h-7 rounded-full border-2 border-[#1E1F6B] flex items-center justify-center flex-shrink-0 bg-white">
        <div className="w-2.5 h-2.5 rounded-full bg-[#1E1F6B]" />
      </div>
    )
  }
  return (
    <div className="w-7 h-7 rounded-full border-2 border-[#E2E0EB] flex-shrink-0 bg-white" />
  )
}

export function MilestoneTracker({ milestones }: { milestones: Milestone[] }) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E0EB] px-6 py-5">
      {milestones.map((m, i) => {
        const isLast = i === milestones.length - 1
        return (
          <div key={m.id} className="flex gap-4">
            {/* Indicator + connector */}
            <div className="flex flex-col items-center">
              <StatusDot status={m.status} />
              {!isLast && (
                <div
                  className={`w-0.5 my-1 flex-1 ${
                    m.status === 'complete' ? 'bg-[#1E1F6B]' : 'bg-[#E2E0EB]'
                  }`}
                  style={{ minHeight: 20 }}
                />
              )}
            </div>

            {/* Text */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-5'}`}>
              <p
                className={`text-sm font-medium ${
                  m.status === 'complete'
                    ? 'text-[#9490A8] line-through'
                    : m.status === 'in_progress'
                    ? 'text-[#2B2B2E]'
                    : 'text-[#5A5575]'
                }`}
              >
                {m.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {m.status === 'in_progress' && (
                  <span className="text-xs font-medium text-[#1E1F6B]">In Progress</span>
                )}
                {m.due_date && (
                  <>
                    {m.status === 'in_progress' && (
                      <span className="text-[#C5C4E0] text-xs">&middot;</span>
                    )}
                    <span className="text-xs text-[#9490A8]">
                      Due{' '}
                      {new Date(m.due_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

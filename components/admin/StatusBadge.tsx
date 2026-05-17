import type { ProjectStatus, MilestoneStatus, DeliverableStatus } from '@/lib/types'

const projectStyles: Record<ProjectStatus, string> = {
  discovery: 'bg-[#EEEDF8] text-[#1E1F6B]',
  design: 'bg-purple-100 text-purple-700',
  build: 'bg-amber-100 text-amber-700',
  launch: 'bg-green-100 text-green-700',
  complete: 'bg-gray-100 text-gray-600',
}

const milestoneStyles: Record<MilestoneStatus, string> = {
  pending: 'bg-gray-100 text-[#9490A8]',
  in_progress: 'bg-amber-100 text-amber-700',
  complete: 'bg-[#8EECD4]/30 text-green-700',
}

const deliverableStyles: Record<DeliverableStatus, string> = {
  pending: 'bg-gray-100 text-[#9490A8]',
  approved: 'bg-[#8EECD4]/30 text-green-700',
  revision: 'bg-red-100 text-[#B33A3A]',
}

function Badge({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${className}`}
    >
      {label.replace('_', ' ')}
    </span>
  )
}

export function ProjectStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={status}
      className={projectStyles[status as ProjectStatus] ?? 'bg-gray-100 text-gray-600'}
    />
  )
}

export function MilestoneStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={status}
      className={milestoneStyles[status as MilestoneStatus] ?? 'bg-gray-100 text-gray-600'}
    />
  )
}

export function DeliverableStatusBadge({ status }: { status: string }) {
  return (
    <Badge
      label={status}
      className={deliverableStyles[status as DeliverableStatus] ?? 'bg-gray-100 text-gray-600'}
    />
  )
}

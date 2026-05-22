function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#E2E0EB] rounded animate-pulse ${className ?? ''}`} />
}

export default function ProjectsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-[#E2E0EB] overflow-hidden">
        <div className="px-6 py-3 border-b border-[#E2E0EB] bg-[#F8F8FA] flex gap-6">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-[#E2E0EB] last:border-0">
            <Skeleton className="h-4 w-36 flex-shrink-0" />
            <Skeleton className="h-4 w-24 flex-shrink-0" />
            <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
            <div className="flex gap-1 flex-1">
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-3 w-20 flex-shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}

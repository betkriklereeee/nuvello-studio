function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#E2E0EB] rounded animate-pulse ${className ?? ''}`} />
}

export default function ClientsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-[#E2E0EB] overflow-hidden">
        <div className="px-6 py-3 border-b border-[#E2E0EB] bg-[#F8F8FA] flex gap-8">
          {['Name', 'Company', 'Projects', 'Added', ''].map((h) => (
            <Skeleton key={h} className="h-3 w-16" />
          ))}
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-8 px-6 py-4 border-b border-[#E2E0EB] last:border-0">
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-6 rounded-md" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}

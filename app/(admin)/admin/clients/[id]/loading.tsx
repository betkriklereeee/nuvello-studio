function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-[#E2E0EB] rounded animate-pulse ${className ?? ''}`} />
}

export default function ClientDetailLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-4 w-24" />
      <div className="bg-white rounded-xl border border-[#E2E0EB] p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-36" />
          </div>
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-[#E2E0EB]">
        <div className="px-6 py-4 border-b border-[#E2E0EB]">
          <Skeleton className="h-4 w-20" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="px-6 py-4 flex items-center justify-between border-b border-[#E2E0EB] last:border-0">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <div className="flex gap-1">
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

import { isImageUrl } from '@/lib/utils/fileUtils'
import type { Annotation, Deliverable } from '@/lib/types'

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function PinCircle({ n }: { n: number }) {
  return (
    <div className="w-7 h-7 rounded-full bg-[#1E1F6B] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
      {n}
    </div>
  )
}

export function AnnotationViewer({
  deliverable,
  annotations,
}: {
  deliverable: Deliverable
  annotations: Annotation[]
}) {
  if (annotations.length === 0) {
    return (
      <p className="text-xs text-[#9490A8] mt-3 pt-3 border-t border-[#E2E0EB]">
        No client feedback yet.
      </p>
    )
  }

  const hasImage = !!deliverable.file_url && isImageUrl(deliverable.file_url)
  const pins = annotations.filter((a) => a.type === 'pin')
  const comments = annotations.filter((a) => a.type === 'comment')

  return (
    <div className="mt-3 pt-3 border-t border-[#E2E0EB] space-y-4">
      {/* Image with pinned overlays */}
      {hasImage && pins.length > 0 && (
        <div>
          <div className="relative rounded-lg overflow-hidden border border-[#E2E0EB]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={deliverable.file_url!}
              alt={deliverable.title}
              className="w-full h-auto block"
            />
            {pins.map((pin) => (
              <div
                key={pin.id}
                style={{
                  position: 'absolute',
                  left: `${pin.x_percent}%`,
                  top: `${pin.y_percent}%`,
                  transform: 'translate(-50%, -50%)',
                  pointerEvents: 'none',
                }}
                className="w-7 h-7 rounded-full bg-[#1E1F6B] text-white text-xs font-semibold flex items-center justify-center select-none"
              >
                {pin.pin_number}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pin comments */}
      {pins.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#5A5575] mb-2">Client Feedback</p>
          <div className="space-y-2">
            {pins.map((pin) => (
              <div key={pin.id} className="flex items-start gap-3">
                <PinCircle n={pin.pin_number!} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#2B2B2E] leading-relaxed">{pin.body}</p>
                  <p className="text-xs text-[#9490A8] mt-0.5">{formatTime(pin.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General comments */}
      {comments.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#5A5575] mb-2">Comments</p>
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="rounded-lg bg-[#F8F8FA] border border-[#E2E0EB] px-4 py-3">
                <p className="text-sm text-[#2B2B2E] leading-relaxed">{c.body}</p>
                <p className="text-xs text-[#9490A8] mt-1">{formatTime(c.created_at)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

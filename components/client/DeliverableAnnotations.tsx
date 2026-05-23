'use client'

import { useState } from 'react'
import { addAnnotation } from '@/lib/client-actions'
import { isImageUrl } from '@/lib/utils/fileUtils'
import type { Annotation, Deliverable } from '@/lib/types'

// ─── Shared helpers ───────────────────────────────────────────────────────────

function formatTime(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function PinCircle({ n, style }: { n: number; style?: React.CSSProperties }) {
  return (
    <div
      style={style}
      className="w-7 h-7 rounded-full bg-[#1E1F6B] text-white text-xs font-semibold flex items-center justify-center flex-shrink-0 select-none"
    >
      {n}
    </div>
  )
}

// ─── Image canvas with pin placement ─────────────────────────────────────────

interface PendingPin {
  x: number
  y: number
  number: number
}

function ImageAnnotationCanvas({
  deliverable,
  annotations,
  onAdd,
}: {
  deliverable: Deliverable
  annotations: Annotation[]
  onAdd: (ann: Annotation) => void
}) {
  const pins = annotations.filter((a) => a.type === 'pin')
  const [pendingPin, setPendingPin] = useState<PendingPin | null>(null)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function handleImageClick(e: React.MouseEvent<HTMLDivElement>) {
    if (pendingPin || submitting) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPendingPin({ x, y, number: pins.length + 1 })
    setComment('')
    setSubmitError('')
  }

  async function handleSubmitPin(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingPin || !comment.trim()) return
    setSubmitting(true)
    setSubmitError('')
    const result = await addAnnotation(
      deliverable.id,
      'pin',
      comment.trim(),
      pendingPin.x,
      pendingPin.y,
      pendingPin.number,
    )
    setSubmitting(false)
    if ('error' in result) {
      setSubmitError(result.error)
    } else {
      onAdd(result.annotation)
      setPendingPin(null)
      setComment('')
    }
  }

  function cancelPending() {
    setPendingPin(null)
    setComment('')
    setSubmitError('')
  }

  return (
    <div className="space-y-4">
      {/* Image with pins */}
      <div>
        <p className="text-xs text-[#5A5575] font-medium mb-2">
          Click anywhere on the image to leave a pin comment.
        </p>
        <div
          className="relative rounded-lg overflow-hidden border border-[#E2E0EB] cursor-crosshair"
          onClick={handleImageClick}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={deliverable.file_url!}
            alt={deliverable.title}
            className="w-full h-auto block"
            draggable={false}
          />

          {/* Saved pins */}
          {pins.map((pin) => (
            <PinCircle
              key={pin.id}
              n={pin.pin_number!}
              style={{
                position: 'absolute',
                left: `${pin.x_percent}%`,
                top: `${pin.y_percent}%`,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            />
          ))}

          {/* Pending (ghost) pin */}
          {pendingPin && (
            <PinCircle
              n={pendingPin.number}
              style={{
                position: 'absolute',
                left: `${pendingPin.x}%`,
                top: `${pendingPin.y}%`,
                transform: 'translate(-50%, -50%)',
                opacity: 0.7,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* Pending pin comment input */}
      {pendingPin && (
        <form
          onSubmit={handleSubmitPin}
          className="rounded-lg border border-[#E2E0EB] bg-[#F8F8FA] p-4 space-y-3"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs font-medium text-[#5A5575]">
            Pin {pendingPin.number} — describe your feedback
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={`Describe your feedback for pin ${pendingPin.number}…`}
            rows={3}
            autoFocus
            required
            className="w-full px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] resize-none bg-white"
          />
          {submitError && <p className="text-xs text-[#B33A3A]">{submitError}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting || !comment.trim()}
              className="px-4 py-1.5 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60 transition-colors"
            >
              {submitting ? 'Saving…' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={cancelPending}
              className="px-4 py-1.5 rounded-lg border border-[#E2E0EB] text-sm text-[#5A5575] hover:bg-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Pin list */}
      {pins.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#5A5575] mb-2">Feedback</p>
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
    </div>
  )
}

// ─── General comment box ──────────────────────────────────────────────────────

function CommentAnnotationBox({
  deliverable,
  annotations,
  onAdd,
}: {
  deliverable: Deliverable
  annotations: Annotation[]
  onAdd: (ann: Annotation) => void
}) {
  const comments = annotations.filter((a) => a.type === 'comment')
  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    setSubmitError('')
    const result = await addAnnotation(deliverable.id, 'comment', text.trim())
    setSubmitting(false)
    if ('error' in result) {
      setSubmitError(result.error)
    } else {
      onAdd(result.annotation)
      setText('')
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Leave a comment on this deliverable…"
          rows={3}
          required
          className="w-full px-3 py-2 rounded-md border border-[#E2E0EB] text-sm text-[#2B2B2E] placeholder-[#9490A8] focus:outline-none focus:ring-2 focus:ring-[#C5C4E0] resize-none bg-[#F8F8FA]"
        />
        {submitError && <p className="text-xs text-[#B33A3A]">{submitError}</p>}
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="px-4 py-1.5 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60 transition-colors"
        >
          {submitting ? 'Posting…' : 'Add Comment'}
        </button>
      </form>

      {comments.length > 0 && (
        <div>
          <p className="text-xs font-medium text-[#5A5575] mb-2">Comments</p>
          <div className="space-y-3">
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

// ─── Public component ─────────────────────────────────────────────────────────

export function DeliverableAnnotations({
  deliverable,
  initialAnnotations,
}: {
  deliverable: Deliverable
  initialAnnotations: Annotation[]
}) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations)

  // Per spec: hide annotation UI entirely when approved
  if (deliverable.status === 'approved') return null

  function handleAdd(ann: Annotation) {
    setAnnotations((prev) => [...prev, ann])
  }

  const hasImageUrl = !!deliverable.file_url && isImageUrl(deliverable.file_url)

  return (
    <div className="mt-4 pt-4 border-t border-[#E2E0EB]">
      {hasImageUrl ? (
        <ImageAnnotationCanvas
          deliverable={deliverable}
          annotations={annotations}
          onAdd={handleAdd}
        />
      ) : (
        <CommentAnnotationBox
          deliverable={deliverable}
          annotations={annotations}
          onAdd={handleAdd}
        />
      )}
    </div>
  )
}

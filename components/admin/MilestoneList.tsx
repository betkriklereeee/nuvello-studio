'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { GripVertical, Trash2, Plus, Check, Clock, Circle } from 'lucide-react'
import { addMilestone, toggleMilestoneStatus, removeMilestone, reorderMilestones } from '@/lib/actions'
import type { Milestone, MilestoneStatus } from '@/lib/types'

const statusIcon: Record<MilestoneStatus, React.ReactNode> = {
  pending: <Circle size={16} className="text-[#9490A8]" />,
  in_progress: <Clock size={16} className="text-amber-500" />,
  complete: <Check size={16} className="text-green-600" />,
}

const statusLabel: Record<MilestoneStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  complete: 'Complete',
}

export function MilestoneList({
  projectId,
  initialMilestones,
}: {
  projectId: string
  initialMilestones: Milestone[]
}) {
  const [milestones, setMilestones] = useState(initialMilestones)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  const router = useRouter()

  function handleDragEnd(result: DropResult) {
    if (!result.destination || result.destination.index === result.source.index) return
    const reordered = Array.from(milestones)
    const [moved] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, moved)
    setMilestones(reordered) // optimistic
    startTransition(() => {
      reorderMilestones(projectId, reordered.map((m) => m.id))
    })
  }

  function handleToggle(m: Milestone) {
    const next: MilestoneStatus =
      m.status === 'pending' ? 'in_progress' : m.status === 'in_progress' ? 'complete' : 'pending'
    setMilestones((prev) =>
      prev.map((x) => (x.id === m.id ? { ...x, status: next } : x))
    ) // optimistic
    startTransition(() => {
      toggleMilestoneStatus(m.id, m.status, projectId)
    })
  }

  async function handleDelete(id: string) {
    setMilestones((prev) => prev.filter((m) => m.id !== id)) // optimistic
    await removeMilestone(id, projectId)
    router.refresh()
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    setLoading(true)
    await addMilestone({
      project_id: projectId,
      title: title.trim(),
      due_date: dueDate || null,
      sort_order: milestones.length,
    })
    setTitle('')
    setDueDate('')
    setShowForm(false)
    setLoading(false)
    router.refresh()
  }

  return (
    <div>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="milestones">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-1">
              {milestones.length === 0 && !showForm && (
                <p className="py-4 text-sm text-center text-[#9490A8]">
                  No milestones yet.
                </p>
              )}
              {milestones.map((m, index) => (
                <Draggable key={m.id} draggableId={m.id} index={index}>
                  {(drag, snapshot) => (
                    <div
                      ref={drag.innerRef}
                      {...drag.draggableProps}
                      className={[
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-shadow',
                        snapshot.isDragging
                          ? 'bg-white border-[#C5C4E0] shadow-md'
                          : 'bg-white border-[#E2E0EB] hover:border-[#C5C4E0]',
                      ].join(' ')}
                    >
                      {/* Drag handle */}
                      <span
                        {...drag.dragHandleProps}
                        className="text-[#C5C4E0] hover:text-[#9490A8] cursor-grab active:cursor-grabbing flex-shrink-0"
                      >
                        <GripVertical size={16} />
                      </span>

                      {/* Status toggle */}
                      <button
                        onClick={() => handleToggle(m)}
                        title={`Status: ${statusLabel[m.status]} — click to advance`}
                        className="flex-shrink-0 hover:scale-110 transition-transform"
                      >
                        {statusIcon[m.status]}
                      </button>

                      {/* Title */}
                      <span
                        className={[
                          'flex-1 text-sm',
                          m.status === 'complete'
                            ? 'line-through text-[#9490A8]'
                            : 'text-[#2B2B2E]',
                        ].join(' ')}
                      >
                        {m.title}
                      </span>

                      {/* Due date */}
                      {m.due_date && (
                        <span className="text-xs text-[#9490A8] flex-shrink-0">
                          {new Date(m.due_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      )}

                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(m.id)}
                        className="flex-shrink-0 p-1 rounded text-[#C5C4E0] hover:text-[#B33A3A] transition-colors"
                        title="Delete milestone"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add form */}
      {showForm ? (
        <form onSubmit={handleAdd} className="mt-2 flex items-center gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Milestone title…"
            autoFocus
            className="flex-1 px-3 py-2 rounded-md border border-[#E2E0EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5C4E0]"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 rounded-md border border-[#E2E0EB] text-sm focus:outline-none focus:ring-2 focus:ring-[#C5C4E0]"
          />
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className="px-3 py-2 rounded-lg bg-[#1E1F6B] text-white text-sm font-medium hover:bg-[#16176B] disabled:opacity-60"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setTitle(''); setDueDate('') }}
            className="px-3 py-2 rounded-lg border border-[#E2E0EB] text-sm text-[#5A5575] hover:bg-[#F8F8FA]"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="mt-2 flex items-center gap-1.5 text-sm text-[#9490A8] hover:text-[#1E1F6B] transition-colors"
        >
          <Plus size={14} />
          Add Milestone
        </button>
      )}
    </div>
  )
}

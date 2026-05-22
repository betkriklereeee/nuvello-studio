'use client'

import { useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { markMessagesRead } from '@/lib/actions'
import type { Message } from '@/lib/types'

export function MessagesSection({
  projectId,
  messages,
}: {
  projectId: string
  messages: Message[]
}) {
  useEffect(() => {
    if (messages.some((m) => !m.read)) {
      markMessagesRead(projectId)
    }
  }, [projectId, messages])

  if (messages.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center gap-2 text-center">
        <MessageCircle size={28} className="text-[#C5C4E0]" />
        <p className="text-sm text-[#9490A8]">No messages from the client yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {messages.map((m) => (
        <div
          key={m.id}
          className={[
            'flex gap-3 p-4 rounded-xl border transition-colors',
            !m.read
              ? 'border-[#C5C4E0] bg-[#EEEDF8]/40'
              : 'border-[#E2E0EB] bg-white',
          ].join(' ')}
        >
          {/* Unread dot */}
          <div className="flex-shrink-0 pt-1.5">
            <div
              className={[
                'w-2 h-2 rounded-full',
                !m.read ? 'bg-[#1E1F6B]' : 'bg-transparent',
              ].join(' ')}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <p className="text-sm font-medium text-[#2B2B2E]">
                {m.clients?.name ?? 'Client'}
              </p>
              <time className="text-xs text-[#9490A8] flex-shrink-0">
                {new Date(m.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </time>
            </div>
            <p className="text-sm text-[#5A5575] mt-1 leading-relaxed whitespace-pre-wrap">
              {m.message}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

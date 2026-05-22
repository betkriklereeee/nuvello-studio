'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function AdminShell({
  children,
  sidebar,
}: {
  children: React.ReactNode
  sidebar: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F8FA]">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — slides in on mobile, always visible on desktop */}
      <div
        className={[
          'fixed inset-y-0 left-0 z-30',
          'md:static md:z-auto',
          'transform transition-transform duration-200 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
        ].join(' ')}
      >
        {/* Close button — mobile only, inside sidebar */}
        <button
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[#9490A8] hover:bg-[#F8F8FA] md:hidden z-10"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
        {sidebar}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center h-14 px-4 bg-white border-b border-[#E2E0EB] flex-shrink-0 gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-[#5A5575] hover:bg-[#F8F8FA]"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-[#2B2B2E]">Nuvello Studio</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 md:p-8 max-w-6xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  )
}

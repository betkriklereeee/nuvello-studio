'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Users, FolderKanban, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SidebarProps {
  userEmail: string
  clientsCount: number
  projectsCount: number
}

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Clients', href: '/admin/clients', icon: Users },
  { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
]

export function Sidebar({ userEmail, clientsCount, projectsCount }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const counts: Record<string, number> = {
    '/admin/clients': clientsCount,
    '/admin/projects': projectsCount,
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-60 flex-shrink-0 h-screen flex flex-col bg-white border-r border-[#E2E0EB]">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-[#E2E0EB] overflow-hidden">
        <Link href="/admin">
          <Image
            src="/logo.png"
            alt="Nuvello Web"
            width={140}
            height={42}
            className="h-auto max-w-[140px]"
            priority
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive =
            href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-[#EEEDF8] text-[#1E1F6B]'
                  : 'text-[#5A5575] hover:bg-[#F8F8FA] hover:text-[#2B2B2E]',
              ].join(' ')}
            >
              <span className="flex items-center gap-2.5">
                <Icon size={16} />
                {label}
              </span>
              {counts[href] !== undefined && (
                <span
                  className={[
                    'text-xs px-1.5 py-0.5 rounded-md font-medium',
                    isActive
                      ? 'bg-[#C5C4E0] text-[#1E1F6B]'
                      : 'bg-[#F8F8FA] text-[#9490A8]',
                  ].join(' ')}
                >
                  {counts[href]}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-[#E2E0EB] space-y-0.5">
        <p className="px-3 py-1 text-xs text-[#9490A8] truncate">{userEmail}</p>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#5A5575] hover:bg-[#F8F8FA] hover:text-[#B33A3A] transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}

'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function TopNav({ displayName }: { displayName: string }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-white border-b border-[#E2E0EB]">
      <div className="px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard">
          <Image
            src="/logo.png"
            alt="Nuvello Web"
            width={140}
            height={48}
            className="h-12 w-auto"
            priority
          />
        </Link>
        <div className="flex items-center gap-5">
          <span className="text-sm text-[#5A5575]">{displayName}</span>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-sm text-[#9490A8] hover:text-[#B33A3A] transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  )
}

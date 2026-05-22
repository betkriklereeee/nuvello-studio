import { createAdminClient } from '@/lib/supabase/admin'
import { ClientsTable } from '@/components/admin/ClientsTable'
import type { Client } from '@/lib/types'

export const metadata = { title: 'Clients — Nuvello Studio' }

export default async function ClientsPage() {
  const db = createAdminClient()
  const { data } = await db
    .from('clients')
    .select('*, projects(count)')
    .order('created_at', { ascending: false })

  return <ClientsTable clients={(data as Client[]) ?? []} />
}

'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from './supabase/admin'

export async function approveDeliverable(id: string, projectId: string) {
  const db = createAdminClient()
  const { error } = await db
    .from('deliverables')
    .update({ status: 'approved' })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function requestRevision(id: string, projectId: string, notes: string) {
  const db = createAdminClient()
  const { error } = await db
    .from('deliverables')
    .update({ status: 'revision', revision_notes: notes })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

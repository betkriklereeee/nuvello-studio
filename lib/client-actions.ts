'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from './supabase/admin'
import { sendDeliverableApprovedEmail, sendRevisionRequestedEmail } from './resend/emails'

async function getDeliverableContext(id: string) {
  const db = createAdminClient()
  const { data: deliverable } = await db
    .from('deliverables')
    .select('title, project_id')
    .eq('id', id)
    .single()
  if (!deliverable) return null

  const { data: project } = await db
    .from('projects')
    .select('name, client_id')
    .eq('id', deliverable.project_id)
    .single()
  if (!project) return null

  const { data: client } = await db
    .from('clients')
    .select('name')
    .eq('id', project.client_id)
    .single()

  return {
    deliverableTitle: deliverable.title,
    projectId: deliverable.project_id,
    projectName: project.name,
    clientName: client?.name ?? 'Your client',
  }
}

export async function approveDeliverable(id: string, projectId: string) {
  const db = createAdminClient()
  const { error } = await db
    .from('deliverables')
    .update({ status: 'approved' })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/projects/${projectId}`)

  const ctx = await getDeliverableContext(id)
  if (ctx) {
    await sendDeliverableApprovedEmail({
      clientName: ctx.clientName,
      deliverableTitle: ctx.deliverableTitle,
      projectName: ctx.projectName,
      projectId: ctx.projectId,
    })
  }

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

  const ctx = await getDeliverableContext(id)
  if (ctx) {
    await sendRevisionRequestedEmail({
      clientName: ctx.clientName,
      deliverableTitle: ctx.deliverableTitle,
      projectName: ctx.projectName,
      projectId: ctx.projectId,
      revisionNotes: notes,
    })
  }

  return { success: true }
}

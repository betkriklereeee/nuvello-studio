'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from './supabase/server'
import { createAdminClient } from './supabase/admin'
import {
  sendDeliverableApprovedEmail,
  sendRevisionRequestedEmail,
  sendNewMessageEmail,
} from './resend/emails'

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
  revalidatePath(`/admin/projects/${projectId}`)

  // BIC: if no other pending/revision deliverables remain → 'clear', else keep 'client'
  const { data: remaining } = await db
    .from('deliverables')
    .select('id')
    .eq('project_id', projectId)
    .in('status', ['pending', 'revision'])
    .neq('id', id)
  const newBic = remaining && remaining.length > 0 ? 'client' : 'clear'
  await db
    .from('projects')
    .update({ bic_status: newBic, bic_updated_at: new Date().toISOString() })
    .eq('id', projectId)

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
  revalidatePath(`/admin/projects/${projectId}`)

  // BIC: client requested revision — ball is now in admin's court
  await db
    .from('projects')
    .update({ bic_status: 'admin', bic_message: null, bic_updated_at: new Date().toISOString() })
    .eq('id', projectId)

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

export async function sendMessage(projectId: string, message: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const db = createAdminClient()

  const { data: client } = await db
    .from('clients')
    .select('id, name')
    .eq('client_user_id', user.id)
    .maybeSingle()
  if (!client) return { error: 'Client record not found' }

  const { data: project } = await db
    .from('projects')
    .select('name')
    .eq('id', projectId)
    .maybeSingle()
  if (!project) return { error: 'Project not found' }

  const { error } = await db.from('messages').insert({
    project_id: projectId,
    client_id: client.id,
    message: message.trim(),
  })
  if (error) return { error: error.message }

  // Email admin (best-effort)
  await sendNewMessageEmail({
    clientName: client.name,
    projectName: project.name,
    messageText: message.trim(),
    projectId,
  })

  return { success: true }
}

'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from './supabase/admin'
import { createClient } from './supabase/server'
import { sendClientInviteEmail, sendDeliverableUploadedEmail, sendPasswordResetEmail, sendBicClientEmail } from './resend/emails'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

// ─── Clients ──────────────────────────────────────────────────────────────────

export async function addClient(data: { name: string; email: string; company?: string }) {
  const db = createAdminClient()

  const { data: linkData, error: linkError } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email: data.email,
    options: { redirectTo: `${baseUrl}/auth/callback` },
  })
  if (linkError) return { error: linkError.message }

  const { error } = await db
    .from('clients')
    .insert({ ...data, client_user_id: linkData.user.id })
  if (error) return { error: error.message }

  revalidatePath('/admin/clients')
  revalidatePath('/admin')
  return { success: true }
}

export async function editClient(id: string, data: { name: string; email: string; company?: string }) {
  const db = createAdminClient()
  const { error } = await db.from('clients').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/clients')
  revalidatePath(`/admin/clients/${id}`)
  return { success: true }
}

export async function removeClient(id: string) {
  const db = createAdminClient()
  const { error } = await db.from('clients').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/clients')
  revalidatePath('/admin')
  return { success: true }
}

export async function sendClientMagicLink(email: string, clientName: string) {
  const db = createAdminClient()
  const { data, error } = await db.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { redirectTo: `${baseUrl}/auth/callback` },
  })
  if (error) return { error: error.message }

  // Send email (best-effort — don't fail if email errors)
  await sendClientInviteEmail({
    clientEmail: email,
    clientName,
    magicLink: data.properties.action_link,
  })

  // Also return the link so admin can copy it as a fallback
  return { success: true, link: data.properties.action_link }
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export async function addProject(data: {
  client_id: string
  name: string
  status: string
  services: string[]
  estimated_hours?: number | null
}) {
  const db = createAdminClient()
  const { error } = await db.from('projects').insert(data)
  if (error) return { error: error.message }
  revalidatePath('/admin/projects')
  revalidatePath('/admin')
  return { success: true }
}

export async function editProject(
  id: string,
  data: { name: string; client_id: string; status: string; services: string[]; estimated_hours?: number | null }
) {
  const db = createAdminClient()
  const { error } = await db.from('projects').update(data).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/projects')
  revalidatePath(`/admin/projects/${id}`)
  return { success: true }
}

export async function removeProject(id: string) {
  const db = createAdminClient()
  const { error } = await db.from('projects').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/projects')
  revalidatePath('/admin')
  return { success: true }
}

export async function setProjectStatus(id: string, status: string) {
  const db = createAdminClient()
  const { error } = await db.from('projects').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${id}`)
  revalidatePath('/admin/projects')
  return { success: true }
}

// ─── Milestones ───────────────────────────────────────────────────────────────

export async function addMilestone(data: {
  project_id: string
  title: string
  due_date?: string | null
  sort_order: number
}) {
  const db = createAdminClient()
  const { error } = await db.from('milestones').insert(data)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${data.project_id}`)
  return { success: true }
}

export async function toggleMilestoneStatus(id: string, current: string, projectId: string) {
  const next =
    current === 'pending' ? 'in_progress' : current === 'in_progress' ? 'complete' : 'pending'
  const db = createAdminClient()
  const { error } = await db.from('milestones').update({ status: next }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${projectId}`)
  return { success: true, next }
}

export async function removeMilestone(id: string, projectId: string) {
  const db = createAdminClient()
  const { error } = await db.from('milestones').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${projectId}`)
  return { success: true }
}

export async function reorderMilestones(projectId: string, orderedIds: string[]) {
  const db = createAdminClient()
  await Promise.all(
    orderedIds.map((id, index) =>
      db.from('milestones').update({ sort_order: index }).eq('id', id)
    )
  )
  revalidatePath(`/admin/projects/${projectId}`)
  return { success: true }
}

// ─── Deliverables ─────────────────────────────────────────────────────────────

export async function addDeliverable(data: {
  project_id: string
  title: string
  file_url?: string | null
}) {
  const db = createAdminClient()
  const { error } = await db.from('deliverables').insert(data)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${data.project_id}`)

  // Fetch project + client for notifications and BIC update
  const { data: project } = await db
    .from('projects')
    .select('name, client_id, bic_status')
    .eq('id', data.project_id)
    .single()

  if (project) {
    const { data: client } = await db
      .from('clients')
      .select('email')
      .eq('id', project.client_id)
      .single()

    // Notify client of new deliverable (best-effort)
    if (client) {
      await sendDeliverableUploadedEmail({
        clientEmail: client.email,
        projectName: project.name,
        deliverableTitle: data.title,
      })
    }

    // Flip BIC to client — uploading means the ball is in the client's court
    const wasAlreadyClient = project.bic_status === 'client'
    await db
      .from('projects')
      .update({ bic_status: 'client', bic_message: null, bic_updated_at: new Date().toISOString() })
      .eq('id', data.project_id)

    // Only email about BIC if it wasn't already 'client'
    if (!wasAlreadyClient && client) {
      await sendBicClientEmail({
        clientEmail: client.email,
        projectName: project.name,
        projectId: data.project_id,
        message: null,
      })
    }
  }

  return { success: true }
}

export async function setDeliverableStatus(id: string, status: string, projectId: string) {
  const db = createAdminClient()
  const { error } = await db.from('deliverables').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${projectId}`)
  return { success: true }
}

export async function removeDeliverable(id: string, projectId: string) {
  const db = createAdminClient()
  const { error } = await db.from('deliverables').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${projectId}`)
  return { success: true }
}

// ─── Drive Folders ────────────────────────────────────────────────────────────

export async function saveProjectDriveFolder(data: {
  client_id: string
  project_id: string
  folder_url: string
}) {
  const db = createAdminClient()
  const match = data.folder_url.match(/[-\w]{25,}/)
  const folder_id = match ? match[0] : data.folder_url

  const { error } = await db.from('drive_folders').upsert(
    { ...data, folder_id },
    { onConflict: 'project_id' }
  )
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${data.project_id}`)
  return { success: true }
}

// ─── Time Entries ─────────────────────────────────────────────────────────────

export async function addTimeEntry(data: {
  project_id: string
  hours: number
  description: string
}) {
  const db = createAdminClient()
  const { error } = await db.from('time_entries').insert(data)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${data.project_id}`)
  return { success: true }
}

export async function removeTimeEntry(id: string, projectId: string) {
  const db = createAdminClient()
  const { error } = await db.from('time_entries').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath(`/admin/projects/${projectId}`)
  return { success: true }
}

// ─── Messages ─────────────────────────────────────────────────────────────────

export async function markMessagesRead(projectId: string) {
  const db = createAdminClient()
  await db.from('messages').update({ read: true }).eq('project_id', projectId).eq('read', false)
  return { success: true }
}

// ─── Assets (Storage) ─────────────────────────────────────────────────────────

export async function listProjectAssets(projectId: string) {
  const db = createAdminClient()
  const { data, error } = await db.storage
    .from('project-assets')
    .list(projectId, { sortBy: { column: 'created_at', order: 'desc' } })
  if (error) return []
  return (data ?? []).filter((f) => f.name !== '.emptyFolderPlaceholder')
}

export async function getAssetDownloadUrl(path: string): Promise<string | null> {
  const db = createAdminClient()
  const { data } = await db.storage
    .from('project-assets')
    .createSignedUrl(path, 3600)
  return data?.signedUrl ?? null
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function updateOnboarded() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }
  const { error } = await supabase
    .from('profiles')
    .update({ onboarded: true })
    .eq('id', user.id)
  if (error) return { error: error.message }
  return { success: true }
}

// ─── Annotations ─────────────────────────────────────────────────────────────

export async function getAnnotations(deliverableId: string) {
  const db = createAdminClient()
  const { data, error } = await db
    .from('annotations')
    .select('*')
    .eq('deliverable_id', deliverableId)
    .order('created_at', { ascending: true })
  if (error) return []
  return data ?? []
}

// ─── Ball in Your Court ───────────────────────────────────────────────────────

export async function updateBicStatus(
  projectId: string,
  bicStatus: 'admin' | 'client' | 'clear',
  bicMessage: string | null
) {
  const db = createAdminClient()

  // Read current status so we can decide whether to send email
  const { data: project } = await db
    .from('projects')
    .select('bic_status, name, client_id')
    .eq('id', projectId)
    .single()
  if (!project) return { error: 'Project not found' }

  const { error } = await db
    .from('projects')
    .update({
      bic_status: bicStatus,
      bic_message: bicMessage || null,
      bic_updated_at: new Date().toISOString(),
    })
    .eq('id', projectId)
  if (error) return { error: error.message }

  revalidatePath(`/admin/projects/${projectId}`)
  revalidatePath(`/dashboard/projects/${projectId}`)

  // Email client only when flipping TO 'client' (not if already 'client')
  if (bicStatus === 'client' && project.bic_status !== 'client') {
    const { data: client } = await db
      .from('clients')
      .select('email')
      .eq('id', project.client_id)
      .single()
    if (client) {
      await sendBicClientEmail({
        clientEmail: client.email,
        projectName: project.name,
        projectId,
        message: bicMessage,
      })
    }
  }

  return { success: true }
}

// ─── Password Reset ───────────────────────────────────────────────────────────

export async function sendPasswordReset(email: string) {
  const db = createAdminClient()
  const { data, error } = await db.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: { redirectTo: `${baseUrl}/auth/callback` },
  })
  if (error) return { error: error.message }
  const link = data.properties?.action_link
  if (!link) return { error: 'Failed to generate reset link' }
  const { error: emailError } = await sendPasswordResetEmail({ clientEmail: email, resetLink: link })
  if (emailError) return { error: emailError }
  return { success: true }
}

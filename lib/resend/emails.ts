import { resend, FROM, ADMIN_EMAIL } from './client'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const LOGO_URL = 'https://studio.nuvelloweb.com/logo.png'
const ACCENT = '#1E1F6B'

function layout(heading: string, body: string, ctaText: string, ctaUrl: string, footer: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${heading}</title></head>
<body style="margin:0;padding:0;background:#F8F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F8FA;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;border:1px solid #E2E0EB;overflow:hidden;">
        <tr><td style="padding:32px 40px 24px;border-bottom:1px solid #E2E0EB;">
          <img src="${LOGO_URL}" alt="Nuvello Studio" height="40" style="height:40px;width:auto;display:block;">
        </td></tr>
        <tr><td style="padding:40px 40px 32px;">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:600;color:#2B2B2E;">${heading}</h1>
          <p style="margin:0 0 32px;font-size:15px;line-height:1.6;color:#5A5575;">${body}</p>
          <a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;background:${ACCENT};color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${ctaText}</a>
        </td></tr>
        <tr><td style="padding:20px 40px 32px;border-top:1px solid #E2E0EB;">
          <p style="margin:0;font-size:12px;color:#9490A8;line-height:1.6;">${footer}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function sendClientInviteEmail({
  clientEmail,
  clientName,
  magicLink,
}: {
  clientEmail: string
  clientName: string
  magicLink: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: "You've been invited to Nuvello Studio",
    html: layout(
      "You're invited",
      `Hi ${clientName}, Nuvello Web has set up your project portal on Nuvello Studio. Click below to access your dashboard.`,
      'Access My Dashboard',
      magicLink,
      "This link expires after first use. If you didn't expect this email, you can safely ignore it."
    ),
  })
  if (error) console.error('[resend] sendClientInviteEmail:', error)
  return { error: error?.message }
}

export async function sendDeliverableUploadedEmail({
  clientEmail,
  projectName,
  deliverableTitle,
}: {
  clientEmail: string
  projectName: string
  deliverableTitle: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: clientEmail,
    subject: `New deliverable ready for your review — ${projectName}`,
    html: layout(
      "Something's ready for you",
      `A new deliverable has been added to your <strong>${projectName}</strong> project: <strong>${deliverableTitle}</strong>. Log in to review and approve it.`,
      'Review Now',
      `${BASE_URL}/dashboard`,
      'You received this because you have an active project on Nuvello Studio.'
    ),
  })
  if (error) console.error('[resend] sendDeliverableUploadedEmail:', error)
  return { error: error?.message }
}

export async function sendDeliverableApprovedEmail({
  clientName,
  deliverableTitle,
  projectName,
  projectId,
}: {
  clientName: string
  deliverableTitle: string
  projectName: string
  projectId: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `${clientName} approved a deliverable`,
    html: layout(
      'Deliverable approved ✓',
      `${clientName} approved <strong>${deliverableTitle}</strong> on <strong>${projectName}</strong>.`,
      'View Project',
      `${BASE_URL}/admin/projects/${projectId}`,
      'This notification was sent automatically by Nuvello Studio.'
    ),
  })
  if (error) console.error('[resend] sendDeliverableApprovedEmail:', error)
  return { error: error?.message }
}

export async function sendRevisionRequestedEmail({
  clientName,
  deliverableTitle,
  projectName,
  projectId,
  revisionNotes,
}: {
  clientName: string
  deliverableTitle: string
  projectName: string
  projectId: string
  revisionNotes: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `${clientName} requested revisions`,
    html: layout(
      'Revision requested',
      `${clientName} requested revisions on <strong>${deliverableTitle}</strong> on <strong>${projectName}</strong>:<br><br><em style="color:#5A5575;">"${revisionNotes}"</em>`,
      'View Project',
      `${BASE_URL}/admin/projects/${projectId}`,
      'This notification was sent automatically by Nuvello Studio.'
    ),
  })
  if (error) console.error('[resend] sendRevisionRequestedEmail:', error)
  return { error: error?.message }
}

export async function sendNewMessageEmail({
  clientName,
  projectName,
  messageText,
  projectId,
}: {
  clientName: string
  projectName: string
  messageText: string
  projectId: string
}) {
  const { error } = await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New message from ${clientName} — ${projectName}`,
    html: layout(
      `New message from ${clientName}`,
      `<strong>${clientName}</strong> sent a message on <strong>${projectName}</strong>:<br><br><em style="color:#5A5575;">"${messageText}"</em>`,
      'View Project',
      `${BASE_URL}/admin/projects/${projectId}`,
      'This notification was sent automatically by Nuvello Studio.'
    ),
  })
  if (error) console.error('[resend] sendNewMessageEmail:', error)
  return { error: error?.message }
}

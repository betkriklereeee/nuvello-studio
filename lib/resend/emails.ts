import { getResend, FROM, ADMIN_EMAIL } from './client'

const PORTAL_URL = 'https://studio.nuvelloweb.com'

// ─── Shared layout ────────────────────────────────────────────────────────────
// `extra` is optional raw HTML injected between the body paragraph and the CTA button.

function layout(
  title: string,
  heading: string,
  body: string,
  ctaText: string,
  ctaUrl: string,
  extra: string = '',
) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F8F8FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="background:#F8F8FA;padding:40px 0;">
    <div style="max-width:520px;margin:0 auto;background:#FFFFFF;border-radius:12px;border:1px solid #E2E0EB;overflow:hidden;">

      <!-- Header -->
      <div style="background:#1E1F6B;padding:32px 40px;">
        <span style="font-size:20px;font-weight:700;color:#FFFFFF;letter-spacing:-0.3px;">nuvello.studio</span>
      </div>

      <!-- Body -->
      <div style="padding:40px;">
        <h1 style="margin:0 0 16px;font-size:22px;font-weight:600;color:#2B2B2E;line-height:1.3;">${heading}</h1>
        <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#5A5575;">${body}</p>
        ${extra ? `${extra}\n        ` : ''}<a href="${ctaUrl}" style="display:inline-block;padding:14px 28px;background:#1E1F6B;color:#FFFFFF;font-size:15px;font-weight:600;text-decoration:none;border-radius:8px;">${ctaText}</a>
      </div>

      <!-- Footer -->
      <div style="border-top:1px solid #E2E0EB;padding:20px 40px;">
        <p style="margin:0;font-size:12px;color:#9490A8;line-height:1.6;">Nuvello Studio &middot; studio.nuvelloweb.com</p>
      </div>

    </div>
  </div>
</body>
</html>`
}

// ─── Email functions ───────────────────────────────────────────────────────────

export async function sendClientInviteEmail({
  clientEmail,
  clientName,
  magicLink,
}: {
  clientEmail: string
  clientName: string
  magicLink: string
}) {
  const { error } = await getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: "You've been invited to Nuvello Studio",
    html: layout(
      "You've been invited to Nuvello Studio",
      "Your client portal is ready",
      `Hi ${clientName}, Nuvello Web has set up your project portal on Nuvello Studio. Click below to access your dashboard and see your projects.`,
      'Access My Dashboard',
      magicLink,
      '',
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
  const { error } = await getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: `New deliverable ready for your review — ${projectName}`,
    html: layout(
      `New deliverable ready for review`,
      "Something's ready for you",
      `A new deliverable has been added to your <strong style="color:#2B2B2E;">${projectName}</strong> project: <strong style="color:#2B2B2E;">${deliverableTitle}</strong>. Log in to review it and leave your feedback or approval.`,
      'Review Now',
      `${PORTAL_URL}/dashboard`,
      '',
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
  const { error } = await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `${clientName} approved a deliverable`,
    html: layout(
      'Deliverable approved',
      'Deliverable approved ✓',
      `<strong style="color:#2B2B2E;">${clientName}</strong> approved <strong style="color:#2B2B2E;">${deliverableTitle}</strong> on <strong style="color:#2B2B2E;">${projectName}</strong>. Open the project to continue.`,
      'View Project',
      `${PORTAL_URL}/admin/projects/${projectId}`,
      '',
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
  const notesBox = `<div style="background:#FFF8F8;border-left:3px solid #B33A3A;border-radius:0 4px 4px 0;padding:12px 16px;margin-bottom:28px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#5A5575;font-style:italic;">&ldquo;${revisionNotes}&rdquo;</p>
        </div>`

  const { error } = await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `${clientName} requested revisions on ${deliverableTitle}`,
    html: layout(
      'Revision requested',
      'Revision requested',
      `<strong style="color:#2B2B2E;">${clientName}</strong> requested revisions on <strong style="color:#2B2B2E;">${deliverableTitle}</strong> in <strong style="color:#2B2B2E;">${projectName}</strong>. Their notes:`,
      'View Project',
      `${PORTAL_URL}/admin/projects/${projectId}`,
      notesBox,
    ),
  })
  if (error) console.error('[resend] sendRevisionRequestedEmail:', error)
  return { error: error?.message }
}

export async function sendAnnotationEmail({
  clientName,
  deliverableTitle,
  projectName,
  projectId,
  annotationBody,
  type,
  pinNumber,
  xPercent,
  yPercent,
}: {
  clientName: string
  deliverableTitle: string
  projectName: string
  projectId: string
  annotationBody: string
  type: 'pin' | 'comment'
  pinNumber?: number | null
  xPercent?: number | null
  yPercent?: number | null
}) {
  const pinLine = type === 'pin' && pinNumber != null
    ? `<p style="margin:8px 0 0;font-size:13px;color:#9490A8;">Pin ${pinNumber} at position ${Math.round(xPercent ?? 0)}%, ${Math.round(yPercent ?? 0)}%</p>`
    : ''

  const quoteBlock = `<div style="background:#F8F8FA;border-left:3px solid #C5C4E0;border-radius:0 4px 4px 0;padding:12px 16px;margin-bottom:28px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#5A5575;">${annotationBody}</p>
          ${pinLine}
        </div>`

  const body = `<strong style="color:#2B2B2E;">${clientName}</strong> left feedback on <strong style="color:#2B2B2E;">${deliverableTitle}</strong> in <strong style="color:#2B2B2E;">${projectName}</strong>:`

  const { error } = await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New feedback on ${deliverableTitle} — ${projectName}`,
    html: layout(
      `New feedback on ${deliverableTitle}`,
      'A client left feedback',
      body,
      'View Feedback',
      `${PORTAL_URL}/admin/projects/${projectId}`,
      quoteBlock,
    ),
  })
  if (error) console.error('[resend] sendAnnotationEmail:', error)
  return { error: error?.message }
}

export async function sendBicClientEmail({
  clientEmail,
  projectName,
  projectId,
  message,
}: {
  clientEmail: string
  projectName: string
  projectId: string
  message?: string | null
}) {
  const body = message
    ? message
    : 'Nuvello has updated your project and is waiting for your input.'
  const { error } = await getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: `Action needed on ${projectName}`,
    html: layout(
      `Action needed on ${projectName}`,
      `Your turn on ${projectName}`,
      body,
      'View Project',
      `${PORTAL_URL}/dashboard/projects/${projectId}`,
      '',
    ),
  })
  if (error) console.error('[resend] sendBicClientEmail:', error)
  return { error: error?.message }
}

export async function sendPasswordResetEmail({
  clientEmail,
  resetLink,
}: {
  clientEmail: string
  resetLink: string
}) {
  const { error } = await getResend().emails.send({
    from: FROM,
    to: clientEmail,
    subject: 'Reset your Nuvello Studio password',
    html: layout(
      'Reset your password',
      'Reset your password',
      'Click below to reset your password for Nuvello Studio. This link is single-use and expires shortly. If you did not request this, you can safely ignore it.',
      'Reset Password',
      resetLink,
      '',
    ),
  })
  if (error) console.error('[resend] sendPasswordResetEmail:', error)
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
  const quoteBox = `<div style="background:#F8F8FA;border-left:3px solid #C5C4E0;border-radius:0 4px 4px 0;padding:12px 16px;margin-bottom:28px;">
          <p style="margin:0;font-size:14px;line-height:1.6;color:#5A5575;">${messageText}</p>
        </div>`

  const { error } = await getResend().emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New message from ${clientName} — ${projectName}`,
    html: layout(
      `New message from ${clientName}`,
      `New message from ${clientName}`,
      `<strong style="color:#2B2B2E;">${clientName}</strong> sent a message on <strong style="color:#2B2B2E;">${projectName}</strong>:`,
      'View Project',
      `${PORTAL_URL}/admin/projects/${projectId}`,
      quoteBox,
    ),
  })
  if (error) console.error('[resend] sendNewMessageEmail:', error)
  return { error: error?.message }
}

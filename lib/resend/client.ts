import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM = 'studio@nuvelloweb.com'
export const ADMIN_EMAIL = 'benjamin@nuvelloweb.com'

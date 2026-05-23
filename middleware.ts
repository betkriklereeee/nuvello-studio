import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname, searchParams } = request.nextUrl

  // ── Recovery/expired-link intercept ──────────────────────────────────────
  // If a Supabase recovery link lands on /admin or /dashboard (e.g. because
  // the user was already signed in when they clicked it), catch it here and
  // send to the dedicated reset-password page.
  // Note: hash fragments are not sent to the server, so we check query params
  // only. The callback page handles the hash fragment case client-side.
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) {
    const isRecovery = searchParams.get('type') === 'recovery'
    const isExpired  = searchParams.get('error_code') === 'otp_expired'
    if (isRecovery || isExpired) {
      return NextResponse.redirect(new URL('/auth/reset-password', request.url))
    }
  }

  // Always call getUser() to refresh the session cookie
  const { data: { user } } = await supabase.auth.getUser()

  // ── /admin — must be authenticated and have role 'admin' ─────────────────
  if (pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return response
  }

  // ── /dashboard — must be authenticated ───────────────────────────────────
  if (pathname.startsWith('/dashboard')) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // ── /login — redirect authenticated users to their home ──────────────────
  if (pathname === '/login') {
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const destination = profile?.role === 'admin' ? '/admin' : '/dashboard'
      return NextResponse.redirect(new URL(destination, request.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/login'],
}

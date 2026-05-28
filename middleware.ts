import { NextResponse, type NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Protect admin routes with a presence check for the HttpOnly auth cookie.
  // Backend remains the source of truth for role enforcement.
  if (pathname.startsWith('/admin')) {
    const hasSession = Boolean(req.cookies.get('auth_token')?.value)
    if (!hasSession) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('reason', 'session_required')
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}


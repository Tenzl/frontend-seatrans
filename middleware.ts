import { NextResponse, type NextRequest } from 'next/server'
import {
  buildContentSecurityPolicy,
  createCspNonce,
} from '@/shared/security/contentSecurityPolicy'

function nextWithCsp(request: NextRequest) {
  const nonce = createCspNonce()
  const csp = buildContentSecurityPolicy(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  })
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (pathname.startsWith('/admin')) {
    const hasSession = Boolean(req.cookies.get('auth_token')?.value)
    if (!hasSession) {
      const url = req.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('reason', 'session_required')
      const redirect = NextResponse.redirect(url)
      const nonce = createCspNonce()
      redirect.headers.set('Content-Security-Policy', buildContentSecurityPolicy(nonce))
      return redirect
    }
  }

  return nextWithCsp(req)
}

export const config = {
  matcher: [
    {
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|icon-image|landing-image|tinymce|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|css|js|json)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}

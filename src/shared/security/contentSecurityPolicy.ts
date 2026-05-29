const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8080'

export function createCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}

export function buildContentSecurityPolicy(nonce: string): string {
  const isProd = process.env.NODE_ENV === 'production'

  const scriptSrc = isProd
    ? [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
      ].join(' ')
    : [
        "'self'",
        `'nonce-${nonce}'`,
        "'strict-dynamic'",
        "'unsafe-eval'",
      ].join(' ')

  const connectSrc = isProd
    ? `'self' ${API_ORIGIN} https: http:`
    : `'self' ${API_ORIGIN} ws: wss: https: http:`

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https:",
    "style-src-elem 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data: https:",
    `connect-src ${connectSrc}`,
  ].join('; ')
}

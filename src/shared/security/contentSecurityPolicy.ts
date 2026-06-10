const API_ORIGIN =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8080'

/** Inline JSON-LD in root layout — re-run scripts/compute-jsonld-hash.mjs after schema edits */
const ORGANIZATION_JSON_LD_HASH =
  "'sha256-Xh+TGAhBK9uvuMTWMDuADN3VVSNwcgtcVGNqmO1KukE='"

export function createCspNonce(): string {
  return Buffer.from(crypto.randomUUID()).toString('base64')
}

export function buildContentSecurityPolicy(nonce: string): string {
  const isProd = process.env.NODE_ENV === 'production'

  const scriptSrc = isProd
    ? [
        "'self'",
        `'nonce-${nonce}'`,
        ORGANIZATION_JSON_LD_HASH,
        "'strict-dynamic'",
        'https://www.googletagmanager.com',
        'https://www.google-analytics.com',
      ].join(' ')
    : [
        "'self'",
        `'nonce-${nonce}'`,
        ORGANIZATION_JSON_LD_HASH,
        "'strict-dynamic'",
        "'unsafe-eval'",
      ].join(' ')

  // blob: + data: are required so GLTFLoader/ImageBitmapLoader can fetch() the
  // object-URL textures it extracts from a GLB (fetch is governed by connect-src,
  // not img-src). Without them three.js reports "Couldn't load texture blob:".
  const connectSrc = isProd
    ? `'self' ${API_ORIGIN} https: http: blob: data:`
    : `'self' ${API_ORIGIN} ws: wss: https: http: blob: data:`

  return [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "frame-src 'self' https://maps.google.com https://www.google.com https://google.com https://maps.googleapis.com",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https:",
    "style-src-elem 'self' 'unsafe-inline' https:",
    "img-src 'self' data: blob: https: http:",
    "font-src 'self' data: https:",
    `connect-src ${connectSrc}`,
  ].join('; ')
}

/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'
const API_ORIGIN = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || 'http://localhost:8080'

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    'zod',
    '@tanstack/react-query',
    'date-fns',
    'react-day-picker',
    'react-phone-number-input',
    'swiper',
    'd3-geo',
  ],
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
    ],
  },
  async rewrites() {
    if (isProd) return []
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ]
  },
  async headers() {
    const csp = isProd
      ? [
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          // Next.js commonly needs inline styles; move to nonces later if desired.
          "style-src 'self' 'unsafe-inline' https:",
          "style-src-elem 'self' 'unsafe-inline' https:",
          "img-src 'self' data: blob: https: http:",
          "font-src 'self' data: https:",
          `connect-src 'self' ${API_ORIGIN} https: http:`,
          // Allow GTM; no inline scripts in prod.
          "script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com",
        ].join('; ')
      : [
          // Dev only: allow inline + eval for React Refresh / HMR tooling.
          "default-src 'self'",
          "base-uri 'self'",
          "object-src 'none'",
          "frame-ancestors 'none'",
          "style-src 'self' 'unsafe-inline' https:",
          "style-src-elem 'self' 'unsafe-inline' https:",
          "img-src 'self' data: blob: https: http:",
          "font-src 'self' data: https:",
          `connect-src 'self' ${API_ORIGIN} ws: wss: https: http:`,
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https: http:",
        ].join('; ')

    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: isProd
              ? 'public, max-age=31536000, immutable'
              : 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400' },
        ],
      },
      {
        source: '/icon-image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/landing-image/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/tinymce/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' }] : []),
          {
            key: 'Content-Security-Policy',
            value: csp,
          },
        ],
      },
    ]
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false
    config.resolve.alias.encoding = false

    config.module.rules.push({
      test: /\.json$/,
      type: 'json',
    })
    return config
  },
}

module.exports = nextConfig

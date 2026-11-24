/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

// '/' makes browser requests same-origin; the server proxy still needs a backend.
const publicApiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim()
const explicitProxyTarget =
  (process.env.API_PROXY_TARGET || '').trim() ||
  (/^https?:\/\//.test(publicApiBase) ? publicApiBase : '')

if (isProd && !explicitProxyTarget) {
  throw new Error('API_PROXY_TARGET is required in production (backend HTTPS origin).')
}

const apiProxyTarget = (explicitProxyTarget || 'http://127.0.0.1:8080')
  .replace(/\/+$/, '')
  .replace(/\/api(?:\/v\d+)?$/, '')

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
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${apiProxyTarget}/api/:path*`,
      },
    ]
  },
  async headers() {
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

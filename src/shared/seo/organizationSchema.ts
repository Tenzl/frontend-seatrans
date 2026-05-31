export const siteUrl = 'https://seatrans.vercel.app'

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Seatrans',
  url: siteUrl,
  logo: `${siteUrl}/landing-image/web_Logo.png`,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+84 935 015 679',
    contactType: 'customer service',
    areaServed: 'VN',
  },
  address: {
    '@type': 'PostalAddress',
    streetAddress: '51 Luu Huu Phuoc',
    addressRegion: 'Gia Lai',
    addressCountry: 'VN',
  },
  sameAs: ['https://www.facebook.com/seatrans.info'],
} as const

/** CSP script-src hash — re-run `node scripts/compute-jsonld-hash.mjs` after schema changes */
export const organizationSchemaJson = JSON.stringify(organizationSchema).replace(/</g, '\\u003c')

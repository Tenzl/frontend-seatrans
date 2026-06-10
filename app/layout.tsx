import type { Metadata } from 'next'
import Script from 'next/script'
import { Archivo, Merriweather, Fira_Code } from 'next/font/google'
import { connection } from 'next/server'
import { headers } from 'next/headers'
import { Suspense } from 'react'
import { AuthProvider } from '@/modules/auth/context/AuthContext'
import { Toaster } from '@/shared/components/ui/sonner'
import { NProgressProvider } from '@/shared/components/NProgressProvider'
import '@/styles/nprogress.css'
import './globals.css'
import { organizationSchemaJson, siteUrl } from '@/shared/seo/organizationSchema'

const archivo = Archivo({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
})

const merriweather = Merriweather({
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '700'],
  variable: '--font-serif',
  display: 'swap',
  preload: false,
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
})

const gaMeasurementId = 'G-NQK767RG2P'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Seatrans - Maritime Logistics Solutions',
    template: '%s | Seatrans',
  },
  description: 'Professional shipping agency, chartering broking, and freight forwarding services',
  authors: [{ name: 'Seatrans' }],
  creator: 'Seatrans',
  publisher: 'Seatrans',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: siteUrl,
    title: 'Seatrans - Maritime Logistics Solutions',
    description: 'Professional shipping agency, chartering broking, and freight forwarding services',
    siteName: 'Seatrans',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Seatrans - Maritime Logistics Solutions',
    description: 'Professional shipping agency, chartering broking, and freight forwarding services',
  },
  icons: {
    icon: '/landing-image/web_Logo.png',
    apple: '/landing-image/web_Logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await connection()

  const nonceHeader = (await headers()).get('x-nonce')
  const nonce = nonceHeader?.trim() ? nonceHeader.trim() : undefined

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${archivo.variable} ${merriweather.variable} ${firaCode.variable}`} suppressHydrationWarning>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          strategy="afterInteractive"
          nonce={nonce}
        />
        <Script id="ga4-init" strategy="afterInteractive" nonce={nonce}>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaMeasurementId}');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: organizationSchemaJson }}
        />
        <AuthProvider>
          <Suspense fallback={null}>
            <NProgressProvider />
          </Suspense>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}

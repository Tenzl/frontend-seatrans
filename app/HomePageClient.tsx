'use client'

import { useRouter } from 'next/navigation'
import Header from '@/shared/components/layout/Header/Header'
import { Hero } from '@/modules/landing/components/public/Hero'
import { Solutions } from '@/modules/landing/components/public/Solutions'
import { Coverage } from '@/modules/landing/components/public/Coverage'
import { FieldGallery } from '@/modules/gallery/components/public/FieldGallery'
import { Updates } from '@/modules/landing/components/public/Updates'
import { Partners } from '@/modules/landing/components/public/Partners'
import { LandingCtaBand } from '@/modules/landing/components/public/LandingCtaBand'
import { Footer } from '@/shared/components/layout/Footer'
import { ScrollToTop } from '@/shared/components/layout/ScrollToTop'

export default function HomePageClient() {
  const router = useRouter()

  const scrollToSolutions = () => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background landing-grain">
      <Header />
      <main className="landing-main">
        <Hero
          title="Maritime logistics across Vietnam and the region"
          subtitle="South East Asia Transport & Logistics"
          primaryCTA={{
            text: 'View services',
            action: scrollToSolutions,
          }}
          secondaryCTA={{
            text: 'Contact desk',
            action: () => router.push('/contact'),
          }}
          trustBadges={[
            { label: 'Ports served', value: '147' },
            { label: 'Vessels / year', value: '2,417' },
            { label: 'Median response', value: '1h 52m' },
          ]}
        />
        <Solutions onNavigate={(page) => router.push(`/${page}`)} />
        <Coverage />
        <FieldGallery />
        <Updates onNavigateToArticle={(id: number) => router.push(`/insights/${id}`)} />
        <Partners />
        <LandingCtaBand />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

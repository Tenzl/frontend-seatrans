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
  const scrollToSolutions = () => document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-background">
      <Header overlay />
      <main className="landing-main">
        <Hero
          primaryCTA={{ text: 'Liên hệ ngay', action: () => router.push('/contact') }}
          secondaryCTA={{ text: 'Xem dịch vụ', action: scrollToSolutions }}
        />
        <Solutions />
        <Coverage />
        <FieldGallery />
        <Updates />
        <Partners />
        <LandingCtaBand />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

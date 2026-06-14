'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { useScreenSize } from '@/shared/hooks/use-screen-size'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { GooeyFilter } from '@/shared/components/ui/gooey-filter'
import { PixelTrail } from '@/shared/components/ui/pixel-trail'

const EASE_OUT = [0.23, 1, 0.32, 1] as const
const FALLBACK_HERO_IMAGE = '/landing-image/other_hero.png'

// Per-page hero image, keyed by the short service name passed to this component.
const HERO_IMAGES: Record<string, string> = {
  'Shipping Agency': '/landing-image/solution/shipping_agency.png',
  'Freight Forwarding': '/landing-image/solution/freight_forwarding.png',
  'Chartering & Broking': '/landing-image/solution/chatering_broking.png',
  'Total Logistics': '/landing-image/solution/total_logistic.png',
  Contact: '/landing-image/solution/contact.png',
  Insights: '/landing-image/solution/insight.png',
}

export interface HeroBannerSectionProps {
  title: string
  subtitle?: string
  description?: string
  image?: string
  serviceName: string
  serviceIcon?: LucideIcon
  onNavigateHome?: () => void
  variant?: 'service' | 'contact'
}

export function HeroBannerSection({ serviceName }: HeroBannerSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const screenSize = useScreenSize()
  const gooeyId = 'gooey-hero-pixel-trail'
  const heroImage = HERO_IMAGES[serviceName] ?? FALLBACK_HERO_IMAGE

  const Title = prefersReducedMotion ? 'h1' : motion.h1
  const titleProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, transform: 'translateY(10px)' },
        animate: { opacity: 1, transform: 'translateY(0)' },
        transition: { duration: 0.4, ease: EASE_OUT },
      }

  return (
    <section
      className="relative isolate flex min-h-[min(46dvh,380px)] items-center justify-center overflow-hidden bg-black"
      aria-label={`${serviceName} introduction`}
    >
      {/* Background image */}
      <div className="absolute inset-0 -z-10" aria-hidden>
        <ImageWithFallback
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-center"
        />
      </div>
      {/* Dark scrim — keeps the white title and gooey trail legible over the photo */}
      <div className="absolute inset-0 -z-10 bg-black/45" aria-hidden />

      {/* Interactive gooey pixel trail — sits behind the text, which occludes it */}
      {!prefersReducedMotion && (
        <>
          <GooeyFilter id={gooeyId} strength={5} />
          <div
            className="absolute inset-0 z-0"
            style={{ filter: `url(#${gooeyId})` }}
            aria-hidden
          >
            <PixelTrail
              pixelSize={screenSize.lessThan('md') ? 24 : 32}
              fadeDuration={0}
              delay={500}
              pixelClassName="bg-white"
            />
          </div>
        </>
      )}

      <Title
        {...titleProps}
        className="pointer-events-none relative z-10 px-6 text-center text-3xl font-bold leading-[1.05] tracking-tight text-white md:text-4xl lg:text-5xl"
      >
        {serviceName}
      </Title>
    </section>
  )
}

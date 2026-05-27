'use client'

import { motion } from 'framer-motion'
import { ArrowDown, ArrowRight, Phone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { HeroVisualPanel } from './hero/HeroVisualPanel'

const ICON_STROKE = 1.5

const HERO_IMAGE = 'https://picsum.photos/seed/seatrans-vessel-ops/1400/1050'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 110, damping: 22 },
  },
}

interface HeroProps {
  title?: string
  subtitle?: string
  image?: string
  primaryCTA?: {
    text: string
    action: () => void
  }
  secondaryCTA?: {
    text: string
    action: () => void
  }
  trustBadges?: {
    label: string
    value: string
  }[]
}

export function Hero({
  title,
  subtitle,
  image,
  primaryCTA,
  secondaryCTA,
  trustBadges,
}: HeroProps = {}) {
  const prefersReducedMotion = useReducedMotion()
  const hasContent = Boolean(title)
  const imageSrc = image || HERO_IMAGE
  const imageAlt = title
    ? `${title} — Seatrans port and vessel operations`
    : 'Container vessel alongside port — Seatrans logistics'

  const scrollToSolutions = () => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })
  }

  if (!hasContent) {
    return (
      <section className="relative min-h-[66vh] overflow-hidden border-b border-border">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={imageSrc}
            alt={imageAlt}
            width={1920}
            height={1080}
            priority
            sizes="100vw"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
        </div>
      </section>
    )
  }

  const ContentColumn = prefersReducedMotion ? 'div' : motion.div
  const contentColumnProps = prefersReducedMotion
    ? { className: 'lg:col-span-5 xl:col-span-5 space-y-8' }
    : {
        className: 'lg:col-span-5 xl:col-span-5 space-y-8',
        variants: containerVariants,
        initial: 'hidden' as const,
        animate: 'visible' as const,
      }

  const Item = prefersReducedMotion ? 'div' : motion.div
  const itemProps = prefersReducedMotion ? {} : { variants: itemVariants }

  return (
    <section
      className="relative min-h-[100dvh] overflow-hidden border-b border-border/60 bg-[#f8fafc]"
      aria-label="Introduction"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_100%_0%,hsl(217_55%_92%/0.5),transparent_55%)]"
        aria-hidden
      />

      <div className="container relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-center px-4 pb-14 pt-24 md:px-6 md:pb-16 md:pt-32">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12 xl:gap-16">
          <ContentColumn {...contentColumnProps}>
            <Item {...itemProps} className="space-y-5 max-w-[65ch]">
              {subtitle && (
                <p className="text-xs font-semibold tracking-[0.14em] text-primary uppercase">
                  {subtitle}
                </p>
              )}
              <h1 className="text-4xl font-bold tracking-tighter leading-[1.05] text-slate-900 text-balance md:text-5xl lg:text-[3.35rem]">
                {title}
              </h1>
              <p className="text-base md:text-lg text-slate-600 leading-relaxed text-pretty max-w-[58ch]">
                Agency, chartering, and forwarding from one desk — built for owners and
                operators who need clear answers when the vessel is on approach.
              </p>
            </Item>

            <Item
              {...itemProps}
              className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              {primaryCTA && (
                <Button
                  size="lg"
                  onClick={primaryCTA.action}
                  className="h-12 rounded-full px-8 font-semibold shadow-[0_12px_32px_-8px_hsl(217_55%_40%/0.45)] transition-transform hover:scale-[1.02] active:scale-[0.98] active:translate-y-px"
                >
                  {primaryCTA.text}
                  <ArrowRight className="ml-2 h-4 w-4" strokeWidth={ICON_STROKE} />
                </Button>
              )}
              {secondaryCTA && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={secondaryCTA.action}
                  className="h-12 rounded-full border-slate-300 bg-white/80 px-8 font-medium text-slate-800 backdrop-blur-sm hover:bg-white transition-transform hover:scale-[1.02] active:scale-[0.98] active:translate-y-px"
                >
                  {secondaryCTA.text}
                </Button>
              )}
              <Link
                href="tel:+84935015679"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition-colors px-1 py-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Phone className="h-4 w-4 shrink-0" strokeWidth={ICON_STROKE} />
                <span className="font-mono tabular-nums tracking-tight">+84 93-501-5679</span>
              </Link>
            </Item>

            {trustBadges && trustBadges.length > 0 && (
              <Item {...itemProps}>
                <div className="grid grid-cols-3 gap-3 rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_16px_40px_-24px_hsl(217_40%_30%/0.2)] backdrop-blur-md">
                  {trustBadges.map((badge) => (
                    <div
                      key={badge.label}
                      className="border-r border-slate-200/80 last:border-0 px-1"
                    >
                      <div className="font-mono text-xl font-semibold tabular-nums tracking-tight text-primary md:text-2xl">
                        {badge.value}
                      </div>
                      <div className="mt-1 text-[0.65rem] font-medium leading-snug text-slate-500">
                        {badge.label}
                      </div>
                    </div>
                  ))}
                </div>
              </Item>
            )}
          </ContentColumn>

          <div className="lg:col-span-7 xl:col-span-7 lg:-mr-4 xl:-mr-8">
            <HeroVisualPanel
              imageSrc={imageSrc}
              imageAlt={imageAlt}
              reducedMotion={prefersReducedMotion}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToSolutions}
          className="mt-10 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md px-1 py-2 w-fit group"
          aria-label="Scroll to services"
        >
          <span className="tracking-wide">Services below</span>
          <ArrowDown
            className="h-4 w-4 transition-transform group-hover:translate-y-0.5 motion-safe:animate-[bounce-soft_2s_ease-in-out_infinite]"
            strokeWidth={ICON_STROKE}
          />
        </button>
      </div>
    </section>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Home, LucideIcon, Phone } from 'lucide-react'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'
import { Button } from '@/shared/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb'

const ICON_STROKE = 1.5
const DEFAULT_HERO_IMAGE = 'https://picsum.photos/seed/seatrans-service-hero/1920/1080'
const EASE_OUT = [0.23, 1, 0.32, 1] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.02 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, transform: 'translateY(8px)' },
  visible: {
    opacity: 1,
    transform: 'translateY(0)',
    transition: { duration: 0.22, ease: EASE_OUT },
  },
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

export function HeroBannerSection({
  title,
  subtitle,
  description,
  image,
  serviceName,
  serviceIcon: ServiceIcon,
  onNavigateHome,
  variant = 'service',
}: HeroBannerSectionProps) {
  const prefersReducedMotion = useReducedMotion()
  const imageSrc = image?.trim() || DEFAULT_HERO_IMAGE

  const scrollToQuote = () =>
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })

  const scrollToGallery = () =>
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })

  const scrollToOffices = () =>
    document.getElementById('contact-offices')?.scrollIntoView({ behavior: 'smooth' })

  const scrollToContactForm = () =>
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })

  const metaLine =
    variant === 'contact'
      ? 'Nationwide offices · Direct manager lines · Same-day response'
      : 'Major Vietnam ports · Single operations desk · 24/7 coordination'

  const ContentColumn = prefersReducedMotion ? 'div' : motion.div
  const contentColumnProps = prefersReducedMotion
    ? { className: 'min-w-0 max-w-3xl' }
    : {
        className: 'min-w-0 max-w-3xl',
        variants: containerVariants,
        initial: 'hidden' as const,
        animate: 'visible' as const,
      }

  const Item = prefersReducedMotion ? 'div' : motion.div
  const itemProps = prefersReducedMotion ? {} : { variants: itemVariants }

  const primaryButtonClass =
    'h-9 rounded-md px-4 text-sm font-medium transition-[transform,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97]'

  const secondaryButtonClass =
    'h-9 rounded-md border-white/25 bg-white/5 px-4 text-sm font-medium text-white transition-[transform,background-color,border-color] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] hover:border-white/40 hover:bg-white/10 hover:text-white active:scale-[0.97]'

  return (
    <section
      className="relative isolate min-h-[min(68dvh,640px)] overflow-hidden border-b border-border/40"
      aria-label={`${serviceName} introduction`}
    >
      <div className="absolute inset-0 -z-20" aria-hidden>
        <ImageWithFallback
          src={imageSrc}
          alt=""
          fill
          priority
          sizes="100vw"
          className="h-full w-full object-cover object-center"
        />
      </div>

      <div className="absolute inset-0 -z-10 hero-scrim" aria-hidden />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-r from-scrim/92 via-scrim/78 to-scrim/35"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-scrim/75 via-scrim/15 to-scrim/25"
        aria-hidden
      />

      <div className="container relative mx-auto flex min-h-[min(68dvh,640px)] max-w-7xl flex-col justify-end px-4 pb-12 pt-28 md:px-6 md:pb-16 md:pt-32">
        <Item {...itemProps} className="mb-5">
          <Breadcrumb>
            <BreadcrumbList className="text-xs">
              <BreadcrumbItem>
                <BreadcrumbLink
                  href="/"
                  onClick={(e) => {
                    if (onNavigateHome) {
                      e.preventDefault()
                      onNavigateHome()
                    }
                  }}
                  className="inline-flex items-center gap-1 text-white/60 transition-colors duration-150 hover:text-white"
                >
                  <Home className="h-3 w-3" strokeWidth={ICON_STROKE} aria-hidden />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/35 [&>svg]:text-white/35" />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium text-white">{serviceName}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </Item>

        <ContentColumn {...contentColumnProps}>
          <Item {...itemProps} className="space-y-3">
            {(subtitle || ServiceIcon) && (
              <div className="flex items-center gap-2.5">
                {ServiceIcon ? (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-white/10 text-white">
                    <ServiceIcon className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
                  </span>
                ) : null}
                {subtitle ? (
                  <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/70">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            )}

            <h1 className="max-w-[22ch] text-balance text-2xl font-semibold leading-tight tracking-tight text-white md:text-3xl lg:text-4xl">
              {title}
            </h1>

            {description ? (
              <p className="max-w-[52ch] text-pretty text-sm leading-relaxed text-white/80 md:text-[0.9375rem]">
                {description}
              </p>
            ) : null}

            <p className="text-xs text-white/60">{metaLine}</p>
          </Item>

          <Item {...itemProps} className="mt-5 flex flex-wrap items-center gap-2">
            {variant === 'contact' ? (
              <>
                <Button size="sm" onClick={scrollToOffices} className={primaryButtonClass}>
                  Find an office
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={scrollToContactForm}
                  className={secondaryButtonClass}
                >
                  Special request
                </Button>
                <Link
                  href="tel:+84935015679"
                  className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium text-white/75 transition-colors duration-150 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={ICON_STROKE} />
                  <span className="font-mono tabular-nums">+84 93-501-5679</span>
                </Link>
              </>
            ) : (
              <>
                <Button size="sm" onClick={scrollToQuote} className={primaryButtonClass}>
                  Request a quote
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" strokeWidth={ICON_STROKE} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={scrollToGallery}
                  className={secondaryButtonClass}
                >
                  View gallery
                </Button>
              </>
            )}
          </Item>
        </ContentColumn>
      </div>
    </section>
  )
}

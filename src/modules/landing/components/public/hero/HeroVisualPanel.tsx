'use client'

import { motion } from 'framer-motion'
import { MapPin } from 'lucide-react'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'

const EASE_OUT = [0.23, 1, 0.32, 1] as const

interface HeroVisualPanelProps {
  imageSrc: string
  imageAlt: string
  reducedMotion: boolean
  overlayEyebrow?: string
  overlayTitle?: string
  overlayFooter?: string
  floatingBadge?: string
  variant?: 'service' | 'contact'
  compact?: boolean
}

export function HeroVisualPanel({
  imageSrc,
  imageAlt,
  reducedMotion,
  overlayEyebrow,
  overlayTitle,
  overlayFooter,
  floatingBadge,
  variant = 'service',
  compact = false,
}: HeroVisualPanelProps) {
  const panelMotion = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, transform: 'translateY(8px)' },
        animate: { opacity: 1, transform: 'translateY(0)' },
        transition: { duration: 0.24, ease: EASE_OUT },
      }

  if (compact) {
    return (
      <motion.div className="relative w-full" {...panelMotion}>
        <div className="relative aspect-[16/9] max-h-44 w-full overflow-hidden rounded-xl border border-border/60 bg-muted sm:max-h-48 lg:max-h-52">
          <ImageWithFallback
            src={imageSrc}
            alt={imageAlt}
            width={960}
            height={540}
            priority
            sizes="(min-width: 1024px) 360px, 100vw"
            className="h-full w-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-scrim/35 via-transparent to-transparent"
            aria-hidden
          />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div className="relative w-full lg:h-full lg:min-h-[440px]" {...panelMotion}>
      <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-border/90 bg-muted shadow-[0_20px_50px_-24px_hsl(var(--foreground)/0.15)] sm:aspect-[16/11] lg:aspect-auto lg:h-full lg:min-h-[440px] lg:rounded-[1.75rem]">
        <ImageWithFallback
          src={imageSrc}
          alt={imageAlt}
          width={1200}
          height={900}
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="h-full w-full object-cover"
        />
        <div
          className={
            overlayTitle
              ? 'absolute inset-0 bg-gradient-to-t from-scrim/80 via-scrim/30 to-scrim/5'
              : variant === 'contact'
                ? 'absolute inset-0 bg-gradient-to-t from-scrim/75 via-scrim/25 to-scrim/10'
                : 'absolute inset-0 bg-gradient-to-tr from-scrim/55 via-scrim/15 to-transparent'
          }
          aria-hidden
        />

        {floatingBadge && (
          <div className="absolute right-4 top-4 md:right-5 md:top-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              {floatingBadge}
            </span>
          </div>
        )}

        {overlayTitle && (
          <div className="absolute inset-x-4 bottom-4 md:inset-x-5 md:bottom-5">
            <div className="max-w-sm rounded-2xl border border-white/15 bg-white/10 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_24px_48px_-20px_rgba(0,0,0,0.55)] backdrop-blur-md md:p-5">
              {overlayEyebrow && (
                <p className="mb-1.5 flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/80">
                  <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                  {overlayEyebrow}
                </p>
              )}
              <p className="text-sm font-semibold leading-snug text-white md:text-base">
                {overlayTitle}
              </p>
              {overlayFooter && (
                <p className="mt-1 text-[0.78rem] leading-relaxed text-white/80">
                  {overlayFooter}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

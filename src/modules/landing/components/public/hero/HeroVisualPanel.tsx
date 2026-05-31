'use client'

import { motion } from 'framer-motion'
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
            variant === 'contact'
              ? 'absolute inset-0 bg-gradient-to-t from-scrim/75 via-scrim/25 to-scrim/10'
              : 'absolute inset-0 bg-gradient-to-tr from-scrim/55 via-scrim/15 to-transparent'
          }
          aria-hidden
        />
      </div>
    </motion.div>
  )
}

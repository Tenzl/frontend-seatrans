'use client'

import { motion } from 'framer-motion'
import { Anchor, Clock } from 'lucide-react'
import { ImageWithFallback } from '@/shared/components/ImageWithFallback'

const ICON_STROKE = 1.5

interface HeroVisualPanelProps {
  imageSrc: string
  imageAlt: string
  reducedMotion: boolean
}

export function HeroVisualPanel({ imageSrc, imageAlt, reducedMotion }: HeroVisualPanelProps) {
  return (
    <motion.div
      className="relative h-[min(52vw,420px)] w-full lg:h-full lg:min-h-[520px]"
      initial={reducedMotion ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 90, damping: 22, delay: 0.15 }}
    >
      <div className="absolute -right-4 top-8 hidden h-32 w-32 rounded-full bg-primary/8 blur-3xl lg:block" aria-hidden />
      <div className="absolute -left-6 bottom-12 hidden h-40 w-40 rounded-full bg-sky-200/40 blur-3xl lg:block" aria-hidden />

      <div className="relative h-full overflow-hidden rounded-[2rem] border border-slate-200/80 shadow-[0_24px_60px_-20px_hsl(217_50%_35%/0.22)]">
        <ImageWithFallback
          src={imageSrc}
          alt={imageAlt}
          width={1200}
          height={900}
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="h-full w-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-tr from-slate-900/25 via-transparent to-primary/10"
          aria-hidden
        />

        <motion.div
          className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-auto sm:max-w-[240px] rounded-2xl border border-white/20 bg-white/75 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] backdrop-blur-xl"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 0.45 }}
        >
          <div className="flex items-center gap-2 text-primary">
            <Clock className="h-4 w-4" strokeWidth={ICON_STROKE} aria-hidden />
            <span className="text-xs font-semibold tracking-wide">Operations desk</span>
          </div>
          <p className="mt-2 text-sm font-medium leading-snug text-slate-800">
            Port agency and husbandry with live coordination across Vietnamese hubs.
          </p>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
            <Anchor className="h-3.5 w-3.5 text-primary" strokeWidth={ICON_STROKE} aria-hidden />
            <span className="font-mono tabular-nums">Quy Nhon · HCM · Hai Phong</span>
          </div>
        </motion.div>

        <motion.div
          className="absolute right-5 top-5 hidden rounded-full border border-white/30 bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-lg sm:block"
          animate={reducedMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span className="font-mono tabular-nums">24/7</span> on-call
        </motion.div>
      </div>
    </motion.div>
  )
}

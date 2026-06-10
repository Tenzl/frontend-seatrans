'use client'

import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, Phone, Printer } from 'lucide-react'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

/**
 * Landing hero — full brand-blue field with the company identity on the left
 * and an auto-rotating 3D model of the SEATRANS vessel on the right, over a
 * white operational contact card anchored to the foot of the banner.
 */

// WebGL island, client-only, lazy-loaded so it never blocks first paint.
const Hero3DModel = dynamic(() => import('./hero/Hero3DModel'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="h-9 w-9 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
    </div>
  ),
})

const COMPANY_NAME_EN = 'South East Asia Transport & Logistics J.S.C'
const LEAD =
  'SEATRANS cung cấp giải pháp vận tải và logistics toàn diện, kết nối hàng hóa đến mọi nơi an toàn, nhanh chóng và hiệu quả.'

const MAP_HREF =
  'https://www.google.com/maps/search/?api=1&query=51+L%C6%B0u+H%E1%BB%AFu+Ph%C6%B0%E1%BB%9Bc+Quy+Nh%C6%A1n'

const CONTACT = [
  { icon: Phone, label: 'Số điện thoại', value: '0256-3520379', href: 'tel:+842563520379' },
  { icon: Printer, label: 'Fax', value: '0256-3520479', href: undefined },
  {
    icon: Mail,
    label: 'Email',
    value: 'seatrans.info@seatrans.com.vn',
    href: 'mailto:seatrans.info@seatrans.com.vn',
  },
  {
    icon: MapPin,
    label: 'Địa chỉ',
    value: '51 Lưu Hữu Phước - P. Quy Nhơn - Gia Lai',
    href: MAP_HREF,
    external: true,
  },
] as const

const EASE_OUT = [0.16, 1, 0.3, 1] as const

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.08 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT } },
}

interface HeroProps {
  title?: string
  subtitle?: string
  image?: string
  primaryCTA?: { text: string; action: () => void }
  secondaryCTA?: { text: string; action: () => void }
  /** @deprecated Hero now spotlights the identity + 3D model + contact card. */
  trustBadges?: { label: string; value: string }[]
}

export function Hero({ primaryCTA, secondaryCTA }: HeroProps = {}) {
  const prefersReducedMotion = useReducedMotion()

  const scrollToSolutions = () => {
    document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' })
  }

  const Stage = prefersReducedMotion ? 'div' : motion.div
  const stageProps = prefersReducedMotion
    ? {}
    : { variants: containerVariants, initial: 'hidden' as const, animate: 'visible' as const }
  const Item = prefersReducedMotion ? 'div' : motion.div
  const itemProps = prefersReducedMotion ? {} : { variants: itemVariants }

  const primary = primaryCTA ?? { text: 'Liên hệ ngay', action: scrollToSolutions }
  const secondary = secondaryCTA ?? { text: 'Xem dịch vụ', action: scrollToSolutions }

  const Card = prefersReducedMotion ? 'div' : motion.div
  const cardProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6, delay: 0.5, ease: EASE_OUT },
      }

  return (
    <section className="relative w-full bg-[#0a2356]" aria-label="Giới thiệu công ty">
      {/* Full brand-blue field with a soft light pooled top-left and a darker foot */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_72%_60%_at_22%_28%,#1a4ba0,transparent_62%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#06143a]" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[640px] max-w-[1400px] items-center gap-6 px-4 pb-28 pt-28 sm:px-6 md:min-h-[680px] md:pt-32 lg:grid-cols-2 lg:gap-12 lg:px-8">
        {/* Left — identity & CTAs */}
        <Stage {...stageProps} className="text-white">
          {/* Eyebrow — liquid-glass trust badge */}
          <Item {...itemProps} className="mb-6">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              Đối tác logistics tin cậy tại Đông Nam Á
            </span>
          </Item>

          {/* Heading — company name, second line in a solid accent (no gradient text) */}
          <Item {...itemProps} className="max-w-[640px]">
            <h1 className="text-balance font-extrabold leading-[1.12] tracking-[-0.02em] text-white text-[clamp(1.9rem,1.2rem+2.4vw,3.1rem)] [text-shadow:0_2px_20px_rgba(6,16,40,0.5)]">
              Công ty Cổ phần Vận tải{' '}
              <span className="text-sky-300">&amp; Giao nhận Đông Nam Á</span>
            </h1>
            <p className="mt-4 text-base font-light italic text-white/80 md:text-lg">
              {COMPANY_NAME_EN}
            </p>
            <span className="mt-5 block h-1 w-16 rounded-full bg-sky-400" aria-hidden />
          </Item>

          <Item
            {...itemProps}
            className="mt-6 max-w-[54ch] text-[15px] leading-[1.7] text-white/75 md:text-base"
          >
            {LEAD}
          </Item>

          {/* CTAs with circular-arrow badge */}
          <Item {...itemProps} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={primary.action}
              className="group inline-flex items-center justify-between gap-3 rounded-full bg-primary py-2.5 pl-7 pr-2.5 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-12px_hsl(var(--primary)/0.95)] ring-1 ring-inset ring-white/25 transition-[transform,background-color] duration-300 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {primary.text}
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </button>
            <button
              type="button"
              onClick={secondary.action}
              className="group inline-flex items-center justify-between gap-3 rounded-full border border-white/25 py-2.5 pl-7 pr-2.5 text-sm font-medium text-white/85 transition-[transform,border-color,background-color] duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {secondary.text}
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-4 w-4" strokeWidth={2} />
              </span>
            </button>
          </Item>
        </Stage>

        {/* Right — auto-rotating 3D vessel (desktop only for performance) */}
        <div className="relative hidden h-[420px] lg:block xl:h-[500px]">
          <Hero3DModel />
        </div>
      </div>

      {/* White operational contact card — straddles the banner's bottom edge */}
      <Card
        {...cardProps}
        className="relative z-10 mx-auto -mt-9 max-w-[1400px] px-4 pb-6 sm:px-6 lg:-mt-11 lg:px-8"
      >
        <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-[0_30px_60px_-28px_rgba(8,24,68,0.45)]">
          <div className="grid grid-cols-1 gap-px bg-border/60 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr_1.5fr]">
            {CONTACT.map((item) => {
              const ItemIcon = item.icon
              const inner = (
                <>
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/25 text-primary">
                    <ItemIcon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-sm font-semibold leading-snug text-foreground">
                      {item.value}
                    </span>
                  </span>
                </>
              )
              return item.href ? (
                <a
                  key={item.label}
                  href={item.href}
                  {...(('external' in item && item.external)
                    ? { target: '_blank', rel: 'noopener noreferrer' }
                    : {})}
                  className="flex h-full items-center gap-3 bg-white px-4 py-3.5 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/40 md:px-5 md:py-4"
                >
                  {inner}
                </a>
              ) : (
                <div key={item.label} className="flex h-full items-center gap-3 bg-white px-4 py-3.5 md:px-5 md:py-4">
                  {inner}
                </div>
              )
            })}
          </div>
        </div>
      </Card>
    </section>
  )
}

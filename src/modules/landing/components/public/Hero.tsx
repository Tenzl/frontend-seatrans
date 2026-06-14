'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, Mail, MapPin, Phone, Printer } from 'lucide-react'
import { useReducedMotion } from '@/shared/hooks/useReducedMotion'

/**
 * Landing hero — a full-bleed photo of the SEATRANS headquarters with a dark
 * scrim (heavier on the left) so the company identity and CTAs read cleanly,
 * over a white operational contact card anchored to the foot of the banner.
 */

const HERO_PHOTO = '/landing-image/seatrans_hero.png'
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
  /** @deprecated Hero now spotlights the identity over the HQ photo + contact card. */
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
    <section className="relative w-full bg-background" aria-label="Giới thiệu công ty">
      {/* Photo banner — the HQ image is bounded to this block so the contact card below sits outside it */}
      <div className="relative">
      {/* Full-bleed HQ photo with a dark scrim (heavier left, fading right) for legibility */}
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <Image
          src={HERO_PHOTO}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_58%] md:object-[center_58%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06143a]/96 via-[#06143a]/80 to-[#06143a]/25" />
        {/* Extra dark panel behind the text block on the left */}
        <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#06143a]/95 via-[#06143a]/45 to-transparent md:w-[74%] lg:w-[66%]" />
        {/* Slight top tint only (keeps the transparent header legible); no bottom darkening */}
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#06143a]/25 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-[600px] max-w-[1400px] items-center gap-6 px-4 pb-16 pt-28 sm:px-6 md:min-h-[700px] md:pt-32 lg:grid-cols-12 lg:gap-12 lg:px-8">
        {/* Left — identity & CTAs */}
        <Stage {...stageProps} className="text-white lg:col-span-7 xl:col-span-6">
          {/* Spacer kept where the eyebrow badge was, so the heading doesn't ride up over the rooftop SEATRANS sign */}
          <Item {...itemProps} className="mb-6 h-10" aria-hidden />

          {/* Heading — company name, second line in a solid accent (no gradient text) */}
          <Item {...itemProps} className="max-w-[640px]">
            <h1 className="text-balance font-extrabold leading-[1.12] tracking-[-0.02em] text-white text-[clamp(1.7rem,1.05rem+2vw,2.6rem)] [text-shadow:0_2px_20px_rgba(6,16,40,0.5)]">
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
          <Item {...itemProps} className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={primary.action}
              className="group inline-flex items-center justify-between gap-2.5 rounded-full bg-primary py-2 pl-5 pr-2 text-sm font-semibold text-primary-foreground shadow-[0_18px_40px_-12px_hsl(var(--primary)/0.95)] ring-1 ring-inset ring-white/25 transition-[transform,background-color] duration-300 hover:bg-primary/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {primary.text}
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </button>
            <button
              type="button"
              onClick={secondary.action}
              className="group inline-flex items-center justify-between gap-2.5 rounded-full border border-white/25 py-2 pl-5 pr-2 text-sm font-medium text-white/85 transition-[transform,border-color,background-color] duration-300 hover:border-white/50 hover:bg-white/10 hover:text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {secondary.text}
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 transition-transform duration-300 group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
              </span>
            </button>
          </Item>
        </Stage>
      </div>
      </div>

      {/* White operational contact card — sits below the photo banner, overlapping its bottom edge */}
      <Card
        {...cardProps}
        className="relative z-10 mx-auto -mt-10 max-w-[1400px] px-4 pb-6 sm:px-6 lg:-mt-12 lg:px-8"
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

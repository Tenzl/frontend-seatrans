'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface HeroBannerSectionProps {
  title: string
  subtitle?: string
  description?: string
  image: string
  serviceName: string
  serviceIcon?: LucideIcon
  onNavigateHome?: () => void
}

export function HeroBannerSection({
  serviceName,
}: HeroBannerSectionProps) {
  const scrollToQuote = () =>
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })

  const scrollToGallery = () =>
    document.getElementById('service-gallery')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="border-b border-[#EAEAEA] bg-[#FBFBFA] pt-24 pb-10 md:pt-28 md:pb-12">
      <div className="container max-w-5xl mx-auto px-4 flex flex-col items-center text-center gap-8">

        {/* Service name */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl font-bold tracking-[-0.03em] leading-none text-[#111111]"
        >
          {serviceName}
        </motion.h1>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-3"
        >
          <button
            type="button"
            onClick={scrollToQuote}
            className="rounded-[6px] bg-[#111111] px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-[#333333] active:scale-[0.98]"
          >
            Request a quote
          </button>

          <button
            type="button"
            onClick={scrollToGallery}
            className="rounded-[6px] border border-[#EAEAEA] bg-white px-5 py-2.5 text-sm font-medium text-[#111111] transition-all duration-200 hover:bg-[#F7F6F3] active:scale-[0.98]"
          >
            Gallery
          </button>
        </motion.div>

      </div>
    </section>
  )
}

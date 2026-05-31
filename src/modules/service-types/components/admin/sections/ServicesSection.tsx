'use client'

import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

const ICON_STROKE = 1.5

export interface ServiceItem {
  name: string
  description: string
  icon: LucideIcon
}

/**
 * Asymmetric bento layout:
 * - 1 item  → full row
 * - 2 items → 50/50
 * - 3 items → 60/40 then full
 * - 4+      → first spans full width, rest in 2-col grid
 * - 5+      → first 2 in [2fr 1fr], rest 2-col
 */
function buildGridClass(total: number, index: number): string {
  if (total === 1) return 'col-span-full'
  if (total === 2) return ''
  if (total === 3) {
    if (index === 0) return 'md:col-span-2'
    return ''
  }
  if (total === 4) {
    if (index === 0) return 'col-span-full'
    return ''
  }
  // 5+
  if (index === 0) return 'md:col-span-2'
  return ''
}

export function ServicesSection({
  services,
}: {
  services: {
    sectionTitle: string
    sectionDescription: string
    items: ServiceItem[]
  }
}) {
  const { items } = services

  return (
    <section id="services-section" className="service-section-surface">
      <div className="service-section-inner">
      {/* Section header — 2-col asymmetric */}
      <div className="mb-12 grid gap-6 md:grid-cols-[1fr_1.6fr] md:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary mb-3">
            Scope of services
          </p>
          <h2 className="landing-section-title">
            {services.sectionTitle}
          </h2>
        </div>
        <p className="landing-section-lead max-w-[56ch]">
          {services.sectionDescription}
        </p>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((service, index) => {
          const Icon = service.icon
          const spanClass = buildGridClass(items.length, index)

          return (
            <motion.div
              key={service.name}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{
                type: 'spring',
                stiffness: 100,
                damping: 22,
                delay: index * 0.06,
              }}
              style={{ transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)' }}
              className={`group relative overflow-hidden rounded-2xl service-card p-7 md:p-8 transition-all duration-500 hover:-translate-y-0.5 ${spanClass}`}
            >
              {/* Subtle corner accent that intensifies on hover */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5 transition-all duration-500 group-hover:scale-[2.2] group-hover:bg-primary/8" />

              <div className="relative flex items-start gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/8 border border-primary/15 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary group-hover:shadow-[0_4px_12px_-4px_hsl(var(--primary)/0.35)]">
                  <Icon className="h-5 w-5" strokeWidth={ICON_STROKE} />
                </div>
                <div className="space-y-2 min-w-0 flex-1">
                  <h4 className="font-semibold text-foreground tracking-tight text-balance">
                    {service.name}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Bottom index number — decorative */}
              <span className="absolute bottom-5 right-6 font-mono text-[10px] font-semibold tabular-nums text-border select-none transition-colors group-hover:text-primary/20">
                {String(index + 1).padStart(2, '0')}
              </span>
            </motion.div>
          )
        })}
      </div>
      </div>
    </section>
  )
}

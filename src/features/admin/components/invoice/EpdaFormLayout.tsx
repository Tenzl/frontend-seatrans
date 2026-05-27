'use client'

import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/components/ui/button'

export const EPDA_SECTIONS = [
  { id: 'epda-general', label: 'General information' },
  { id: 'epda-dues', label: 'Port dues and charges' },
  { id: 'epda-agency', label: 'Agency fees' },
] as const

export type EpdaSectionId = (typeof EPDA_SECTIONS)[number]['id']

const FIELD_GRID =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'

export function epdaFieldGridClass(columns?: 3 | 4): string {
  if (columns === 3) {
    return 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'
  }
  return FIELD_GRID
}

export function EpdaSectionNav({ className }: { className?: string }) {
  const scrollToSection = (id: EpdaSectionId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      className={cn('flex flex-wrap gap-2', className)}
      aria-label="EPDA form sections"
    >
      {EPDA_SECTIONS.map((section) => (
        <Button
          key={section.id}
          type="button"
          variant="outline"
          size="sm"
          className="h-8 rounded-full text-xs font-medium transition-transform active:scale-[0.98]"
          onClick={() => scrollToSection(section.id)}
        >
          {section.label}
        </Button>
      ))}
    </nav>
  )
}

interface EpdaFormSectionProps {
  id: EpdaSectionId
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function EpdaFormSection({ id, title, description, children, className }: EpdaFormSectionProps) {
  return (
    <section
      id={id}
      className={cn('scroll-mt-36 space-y-5 border-t border-border/50 pt-8 first:border-t-0 first:pt-0', className)}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold tracking-tight text-foreground">{title}</h3>
        {description ? (
          <p className="max-w-prose text-pretty text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export interface EpdaSummaryItem {
  label: string
  value: string
  hint?: string
}

export function EpdaComputedSummary({
  items,
  className,
}: {
  items: EpdaSummaryItem[]
  className?: string
}) {
  if (items.length === 0) return null

  return (
    <div
      className={cn(
        'grid gap-3 rounded-lg border border-border/60 bg-muted/25 p-4 sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
      role="region"
      aria-label="Calculated amounts"
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
          <p className="font-mono text-sm font-semibold tabular-nums tracking-tight text-foreground">
            {item.value}
          </p>
          {item.hint ? (
            <p className="text-[11px] leading-snug text-muted-foreground">{item.hint}</p>
          ) : null}
        </div>
      ))}
    </div>
  )
}

export function EpdaFormSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-10 animate-pulse rounded-md bg-muted/60"
          style={{ width: `${88 - index * 12}%` }}
        />
      ))}
    </div>
  )
}

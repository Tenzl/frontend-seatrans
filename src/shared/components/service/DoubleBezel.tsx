import { ReactNode } from 'react'
import { cn } from '@/shared/lib/utils'

interface DoubleBezelProps {
  children: ReactNode
  className?: string
}

/**
 * Premium double-border bezel container.
 * Outer ring: subtle border + diffusion shadow.
 * Inner ring: 1px white refraction edge simulating physical glass depth.
 */
export function DoubleBezel({ children, className }: DoubleBezelProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/80 bg-white',
        'shadow-[0_20px_48px_-16px_hsl(217_40%_35%/0.10)]',
        'ring-1 ring-white/60 ring-inset',
        className
      )}
    >
      {children}
    </div>
  )
}

import { cn } from '@/shared/lib/utils'

interface LandingSectionHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: string
  align?: 'left' | 'center'
  className?: string
  action?: React.ReactNode
}

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  action,
}: LandingSectionHeaderProps) {
  const centered = align === 'center'

  return (
    <div
      className={cn(
        'mb-12 md:mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between',
        centered && 'md:flex-col md:items-center text-center',
        className
      )}
    >
      <div className={cn('max-w-2xl space-y-4', centered && 'mx-auto')}>
        {eyebrow && <p className="landing-eyebrow">{eyebrow}</p>}
        <h2 className="landing-display text-balance">{title}</h2>
        {description && (
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className={cn('shrink-0', centered && 'mx-auto')}>{action}</div>}
    </div>
  )
}

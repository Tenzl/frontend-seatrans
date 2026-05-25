"use client"

import type { ReactNode } from "react"
import { cn } from "@/shared/lib/utils"

interface AdminSectionProps {
  children: ReactNode
  /** Optional one-line context under the shell page title */
  description?: string
  /** Primary actions (Add, Import, …) — top right on wide screens */
  actions?: ReactNode
  /** Search, filters, column toggles */
  toolbar?: ReactNode
  className?: string
}

/**
 * Standard admin module body. Page title lives in MainDashboard header only —
 * sections supply description, toolbar, and data panels to avoid double headings.
 */
export function AdminSection({
  children,
  description,
  actions,
  toolbar,
  className,
}: AdminSectionProps) {
  return (
    <section className={cn("admin-section flex min-h-0 flex-col", className)}>
      {(description || actions) && (
        <div className="flex flex-col gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-start sm:justify-between">
          {description ? (
            <p className="max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : (
            <span className="hidden sm:block sm:flex-1" />
          )}
          {actions ? (
            <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
          ) : null}
        </div>
      )}

      {toolbar}

      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  )
}

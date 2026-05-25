"use client"

import { Suspense } from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  canAccessSection,
  DashboardSection,
  getSectionConfig,
  SectionRole,
} from "@/shared/config/dashboard-registry"
import { SectionErrorBoundary, SectionSuspenseFallback } from "@/shared/components/error/SectionErrorBoundary"

interface DashboardContentProps {
  section: DashboardSection
  userRole: SectionRole
}

export function DashboardContent({ section, userRole }: DashboardContentProps) {
  const config = getSectionConfig(section)

  if (!config) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-sm">This section is not configured.</p>
      </div>
    )
  }

  if (!canAccessSection(section, userRole)) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center p-8 text-center">
        <h2 className="text-lg font-semibold tracking-tight">Access denied</h2>
        <p className="mt-2 max-w-sm text-pretty text-sm text-muted-foreground">
          You do not have permission to view this module. Contact an administrator if you need access.
        </p>
      </div>
    )
  }

  const Component = config.component

  return (
    <SectionErrorBoundary sectionId={section}>
      <div className="dashboard-section-inner min-h-0">
        <Suspense fallback={<SectionSuspenseFallback />}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
              transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-0"
            >
              <Component />
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </div>
    </SectionErrorBoundary>
  )
}

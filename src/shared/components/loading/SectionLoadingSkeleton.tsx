"use client"

import { Skeleton } from "@/shared/components/ui/skeleton"

export function SectionLoadingSkeleton() {
  return (
    <div className="admin-section space-y-4 p-5 md:p-6 lg:p-7">
      <Skeleton className="h-4 w-[min(420px,85%)]" />
      <div className="flex flex-wrap gap-2 border-b border-border/50 pb-4">
        <Skeleton className="h-9 w-48 rounded-md" />
        <Skeleton className="h-9 w-36 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-md" />
      </div>
      <Skeleton className="h-[min(360px,52dvh)] w-full rounded-xl" />
    </div>
  )
}

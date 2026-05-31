'use client'

import { useCallback, useEffect, useState } from 'react'
import { History, Loader2 } from 'lucide-react'
import { shippingAgencyEpdaService } from '@/modules/inquiries/services/shippingAgencyEpdaService'
import {
  formatFieldChangeAction,
  formatFieldChangeLabel,
  type InquiryFieldChangeLogEntry,
} from '@/features/admin/components/invoice/epda/epdaCustomerFieldTracking'

interface EpdaFieldChangeHistoryProps {
  inquiryId?: number | null
  refreshKey?: number
}

export function EpdaFieldChangeHistory({ inquiryId, refreshKey = 0 }: EpdaFieldChangeHistoryProps) {
  const [entries, setEntries] = useState<InquiryFieldChangeLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    if (!inquiryId) {
      setEntries([])
      return
    }

    setIsLoading(true)
    try {
      const result = await shippingAgencyEpdaService.listLatestCustomerFieldChanges(inquiryId)
      setEntries(result)
    } catch (error) {
      console.error('Failed to load customer field changes:', error)
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }, [inquiryId])

  useEffect(() => {
    void load()
  }, [load, refreshKey])

  if (!inquiryId) return null

  return (
    <section className="rounded-lg border border-border/60 bg-muted/20 p-4">
      <div className="mb-3 flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-semibold tracking-tight">Customer field change history</h4>
        </div>

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading history…
        </div>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No changes from original customer submission.</p>
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="space-y-1.5 rounded-md border border-border/50 bg-background px-3 py-2.5 text-sm"
              >
                <div className="space-y-0.5">
                  <p className="font-medium leading-snug text-emerald-700 dark:text-emerald-400">
                    {formatFieldChangeLabel(entry.fieldName)}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatFieldChangeAction(entry.action)}
                  </p>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {entry.changedBy.fullName || entry.changedBy.email || `User #${entry.changedBy.id}`}
                  <br />
                  {new Date(entry.createdAt).toLocaleString()}
                </p>
                <p className="text-[11px] leading-relaxed">
                  <span className="text-muted-foreground">Original:</span> {entry.previousValue || '—'}
                  <span className="mx-1 text-muted-foreground">→</span>
                  <span className="font-medium text-emerald-700 dark:text-emerald-400">
                    {entry.newValue || '—'}
                  </span>
                </p>
              </li>
            ))}
          </ul>

                  </>
      )}
    </section>
  )
}

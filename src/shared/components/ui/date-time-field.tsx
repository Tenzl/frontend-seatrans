"use client"

import { memo } from "react"
import { DatePicker } from "@/shared/components/ui/date-picker"
import { Input } from "@/shared/components/ui/input"
import { Label } from "@/shared/components/ui/label"
import { cn } from "@/shared/lib/utils"

export interface DateTimeFieldProps {
  /** Main label above the row (omit when hideLabel) */
  label?: string
  /** Table / compact cells: no top Label */
  hideLabel?: boolean
  htmlForPrefix?: string
  dateValue: string
  timeValue: string
  onDateChange: (date: string) => void
  onTimeChange: (time: string) => void
  disabled?: boolean
  className?: string
  /** Show small "Date" / "Time" hints under EPDA-style split */
  showSublabels?: boolean
}

export const DateTimeField = memo(
  function DateTimeField({
    label,
    hideLabel,
    htmlForPrefix = "dt",
    dateValue,
    timeValue,
    onDateChange,
    onTimeChange,
    disabled,
    className,
    showSublabels = true,
  }: DateTimeFieldProps) {
    return (
      <div className={cn("grid gap-2", className)}>
        {!hideLabel && label ? <Label className="text-foreground">{label}</Label> : null}
        <div className="flex flex-wrap items-end gap-2">
          <div className="grid gap-1 min-w-[160px] flex-1">
            {showSublabels ? (
              <span className="text-xs text-muted-foreground">Date</span>
            ) : null}
            <DatePicker
              id={`${htmlForPrefix}-date`}
              value={dateValue}
              onChange={onDateChange}
              disabled={disabled}
              placeholder="Select date"
            />
          </div>
          <div className="grid gap-1 w-[120px] shrink-0">
            {showSublabels ? (
              <span className="text-xs text-muted-foreground">Time</span>
            ) : null}
            <Input
              id={`${htmlForPrefix}-time`}
              type="time"
              step={60}
              value={timeValue}
              onChange={(e) => onTimeChange(e.target.value)}
              disabled={disabled}
              className="font-mono"
            />
          </div>
        </div>
      </div>
    )
  },
  (prev, next) =>
    prev.dateValue === next.dateValue &&
    prev.timeValue === next.timeValue &&
    prev.disabled === next.disabled &&
    prev.htmlForPrefix === next.htmlForPrefix &&
    prev.label === next.label &&
    prev.hideLabel === next.hideLabel &&
    prev.className === next.className &&
    prev.showSublabels === next.showSublabels
)

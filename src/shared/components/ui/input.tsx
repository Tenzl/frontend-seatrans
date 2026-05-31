import * as React from "react"

import { cn } from "@/shared/lib/utils"

function sanitizeNumberInputValue(value: string, min?: string | number): string {
  let next = value.replace(/-/g, "")
  if (next === "") return next

  const minNumber = min === undefined || min === "" ? undefined : Number(min)
  const parsed = Number(next)
  if (minNumber !== undefined && Number.isFinite(minNumber) && Number.isFinite(parsed) && parsed < minNumber) {
    return String(minNumber)
  }

  return next
}

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, onKeyDown, onWheel, onChange, min, ...props }, ref) => {
    const isNumberInput = type === "number"
    const minNumber = min === undefined || min === "" ? undefined : Number(min)
    const enforceNonNegative =
      isNumberInput && minNumber !== undefined && Number.isFinite(minNumber) && minNumber >= 0

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      onKeyDown?.(event)
      if (event.defaultPrevented || !isNumberInput) return

      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault()
        return
      }

      if (
        enforceNonNegative &&
        (event.key === "-" || event.key === "+" || event.key === "e" || event.key === "E")
      ) {
        event.preventDefault()
      }
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (!enforceNonNegative) {
        onChange?.(event)
        return
      }

      const sanitized = sanitizeNumberInputValue(event.target.value, min)
      if (sanitized === event.target.value) {
        onChange?.(event)
        return
      }

      onChange?.({
        ...event,
        target: { ...event.target, value: sanitized },
        currentTarget: { ...event.currentTarget, value: sanitized },
      })
    }

    const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
      onWheel?.(event)
      if (isNumberInput) {
        event.currentTarget.blur()
      }
    }

    return (
      <input
        type={type}
        min={min}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          isNumberInput &&
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
        onWheel={handleWheel}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

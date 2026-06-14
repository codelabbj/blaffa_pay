"use client"

import { flashpayTheme, stepVisualClass } from "@/lib/flashpay-device-utils"
import { cn } from "@/lib/utils"

interface UssdTimelineProps {
  steps: string[]
  className?: string
}

export function UssdTimeline({ steps, className }: UssdTimelineProps) {
  if (steps.length === 0) {
    return <span className={cn("text-sm", flashpayTheme.muted)}>—</span>
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-x-2 gap-y-2", className)}>
      {steps.map((step, index) => (
        <span key={index} className="inline-flex items-center gap-2">
          {index > 0 && (
            <span
              className="text-sm font-medium text-slate-500 dark:text-slate-300 select-none"
              aria-hidden
            >
              →
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-xs font-semibold leading-none",
              stepVisualClass(step),
            )}
          >
            {step.trim() || "?"}
          </span>
        </span>
      ))}
    </div>
  )
}

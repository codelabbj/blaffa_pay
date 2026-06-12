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
    <div className={cn("flex flex-wrap items-center gap-x-1.5 gap-y-2", className)}>
      {steps.map((step, index) => (
        <span key={`${index}-${step}`} className="inline-flex items-center gap-1.5">
          {index > 0 && (
            <span className="text-xs text-slate-400 dark:text-gray-500 select-none" aria-hidden>
              →
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs font-medium",
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

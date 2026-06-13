"use client"

import { memo, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { GripVertical, Plus, Trash2 } from "lucide-react"
import { flashpayTheme, stepVisualClass } from "@/lib/flashpay-device-utils"

const SHORTCUTS = ["NUM", "AMOUNT", "PIN", "OPKEY"] as const

interface UssdFlowBuilderProps {
  steps: string[]
  onChange: (steps: string[]) => void
  label?: string
}

export const UssdFlowBuilder = memo(function UssdFlowBuilder({ steps, onChange, label }: UssdFlowBuilderProps) {
  const bulkValue = useMemo(() => steps.join("\n"), [steps])
  const updateStep = (index: number, value: string) => {
    const next = [...steps]
    next[index] = value
    onChange(next)
  }

  const removeStep = (index: number) => {
    onChange(steps.filter((_, i) => i !== index))
  }

  const addStep = (value = "") => {
    onChange([...steps, value])
  }

  const insertShortcut = (token: string) => {
    onChange([...steps, token])
  }

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold text-[#0B2545] dark:text-gray-100">{label}</p>}

      <div className="flex flex-wrap gap-2">
        {SHORTCUTS.map((token) => (
          <Button
            key={token}
            type="button"
            size="sm"
            variant="outline"
            className={`h-7 border-[#D4A24C] text-[#0B2545] dark:text-amber-100 dark:border-amber-700 text-xs`}
            onClick={() => insertShortcut(token)}
          >
            + {token}
          </Button>
        ))}
        <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => addStep()}>
          <Plus className="h-3 w-3 mr-1" /> Étape
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div
            key={`${index}-${step}`}
            className={`min-w-[88px] shrink-0 rounded-lg border-2 p-2 ${stepVisualClass(step)} ${!step.trim() ? "border-red-400" : ""}`}
          >
            <div className="flex items-center justify-between mb-1">
              <GripVertical className="h-3 w-3 opacity-40" />
              <button type="button" onClick={() => removeStep(index)} className="text-red-500">
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            <span className="text-[10px] font-bold opacity-60">{index + 1}</span>
            <Input
              value={step}
              onChange={(e) => updateStep(index, e.target.value)}
              className="h-7 mt-1 font-mono text-xs font-medium border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 text-inherit placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>
        ))}
        {steps.length === 0 && (
          <p className={`text-sm ${flashpayTheme.muted} py-4`}>Aucune étape — ajoutez le pipeline USSD</p>
        )}
      </div>

      <details className="rounded-lg border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-800/50 p-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-gray-400">Vue liste (édition bulk)</summary>
        <Textarea
          className="mt-2 font-mono text-sm"
          rows={5}
          value={bulkValue}
          onChange={(e) => onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean))}
          placeholder="Une étape par ligne"
        />
      </details>
    </div>
  )
})

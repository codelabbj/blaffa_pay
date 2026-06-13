"use client"

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react"
import { TableHead } from "@/components/ui/table"

export function SortableHead<T extends string>({
  label,
  field,
  activeField,
  direction,
  onSort,
  className,
}: {
  label: string
  field: T
  activeField: T | null
  direction: "asc" | "desc"
  onSort: (field: T) => void
  className?: string
}) {
  const active = activeField === field
  const Icon = active ? (direction === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(field)}
        className="inline-flex items-center gap-1 font-semibold hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
      >
        {label}
        <Icon className={`h-3.5 w-3.5 ${active ? "text-orange-500" : "text-gray-400"}`} />
      </button>
    </TableHead>
  )
}

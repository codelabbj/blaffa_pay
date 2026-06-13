"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

export function useTableSelection<T extends { uid: string }>(rows: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set())

  useEffect(() => {
    setSelected(new Set())
  }, [rows])

  const selectedRows = useMemo(
    () => rows.filter((r) => selected.has(r.uid)),
    [rows, selected],
  )

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.uid))
  const someSelected = rows.some((r) => selected.has(r.uid))

  const toggleRow = useCallback((uid: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(uid)
      else next.delete(uid)
      return next
    })
  }, [])

  const toggleAll = useCallback(
    (checked: boolean) => {
      if (checked) setSelected(new Set(rows.map((r) => r.uid)))
      else setSelected(new Set())
    },
    [rows],
  )

  const clear = useCallback(() => setSelected(new Set()), [])

  return {
    selected,
    selectedRows,
    allSelected,
    someSelected,
    toggleRow,
    toggleAll,
    clear,
    count: selected.size,
  }
}

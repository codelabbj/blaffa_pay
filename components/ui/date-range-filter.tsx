"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

interface DateRangeFilterProps {
  startDate: string | null
  endDate: string | null
  onStartDateChange: (date: string | null) => void
  onEndDateChange: (date: string | null) => void
  onClear: () => void
  placeholder?: string
  className?: string
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onClear,
  placeholder = "Filtrer par date",
  className = ""
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleStartDateSelect = (date: Date | undefined) => {
    if (date) {
      onStartDateChange(format(date, "yyyy-MM-dd"))
    } else {
      onStartDateChange(null)
    }
  }

  const handleEndDateSelect = (date: Date | undefined) => {
    if (date) {
      onEndDateChange(format(date, "yyyy-MM-dd"))
    } else {
      onEndDateChange(null)
    }
  }

  const hasActiveFilter = startDate || endDate

  const formatDisplayDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: fr })
    } catch {
      return date
    }
  }

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 ${
              hasActiveFilter 
                ? "border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-600" 
                : ""
            }`}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {hasActiveFilter ? (
              <span className="truncate">
                {startDate && endDate 
                  ? `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`
                  : startDate 
                  ? `À partir du ${formatDisplayDate(startDate)}`
                  : `Jusqu'au ${formatDisplayDate(endDate!)}`
                }
              </span>
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
            {hasActiveFilter && (
              <X 
                className="ml-auto h-4 w-4 text-gray-400 hover:text-gray-600" 
                onClick={(e) => {
                  e.stopPropagation()
                  onClear()
                }}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date de début</Label>
                  <CalendarComponent
                    mode="single"
                    selected={startDate ? new Date(startDate) : undefined}
                    onSelect={handleStartDateSelect}
                    locale={fr}
                    className="rounded-md border"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date de fin</Label>
                  <CalendarComponent
                    mode="single"
                    selected={endDate ? new Date(endDate) : undefined}
                    onSelect={handleEndDateSelect}
                    locale={fr}
                    className="rounded-md border"
                    disabled={(date) => startDate ? date < new Date(startDate) : false}
                  />
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onClear()
                      setIsOpen(false)
                    }}
                  >
                    Effacer
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                  >
                    Appliquer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  )
}

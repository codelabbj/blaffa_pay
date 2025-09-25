"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold text-gray-900 dark:text-gray-100",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-lg"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-gray-600 dark:text-gray-400 rounded-lg w-10 font-medium text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-lg [&:has([aria-selected].day-outside)]:bg-gray-100/50 dark:[&:has([aria-selected].day-outside)]:bg-gray-800/50 [&:has([aria-selected])]:bg-orange-50 dark:[&:has([aria-selected])]:bg-orange-900/20 first:[&:has([aria-selected])]:rounded-l-lg last:[&:has([aria-selected])]:rounded-r-lg focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100 rounded-lg"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-gradient-to-r from-orange-600 to-green-600 text-white hover:from-orange-700 hover:to-green-700 focus:from-orange-700 focus:to-green-700 shadow-lg",
        day_today: "bg-orange-100 text-orange-900 dark:bg-orange-900/30 dark:text-orange-100",
        day_outside:
          "day-outside text-gray-400 dark:text-gray-500 aria-selected:bg-gray-100/50 aria-selected:text-gray-400 dark:aria-selected:bg-gray-800/50 dark:aria-selected:text-gray-500",
        day_disabled: "text-gray-400 dark:text-gray-500 opacity-50",
        day_range_middle:
          "aria-selected:bg-orange-50 aria-selected:text-orange-900 dark:aria-selected:bg-orange-900/20 dark:aria-selected:text-orange-100",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

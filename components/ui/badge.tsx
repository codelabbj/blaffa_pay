import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300 dark:hover:bg-orange-900",
        secondary:
          "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700",
        destructive:
          "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900",
        outline: "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
        success: "border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900",
        warning: "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300 dark:hover:bg-yellow-900",
        info: "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900",
        premium: "border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900",
        glass: "border border-white/20 bg-white/10 backdrop-blur-sm text-white hover:bg-white/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full rounded-lg border-2 p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground shadow-sm",
  {
    variants: {
      variant: {
        default: "border-gray-200 bg-white/80 backdrop-blur-sm text-gray-900 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-100",
        destructive:
          "border-red-200 bg-red-50/80 backdrop-blur-sm text-red-900 dark:border-red-800 dark:bg-red-900/20 dark:text-red-100 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        success:
          "border-green-200 bg-green-50/80 backdrop-blur-sm text-green-900 dark:border-green-800 dark:bg-green-900/20 dark:text-green-100 [&>svg]:text-green-600 dark:[&>svg]:text-green-400",
        warning:
          "border-orange-200 bg-orange-50/80 backdrop-blur-sm text-orange-900 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-100 [&>svg]:text-orange-600 dark:[&>svg]:text-orange-400",
        info:
          "border-blue-200 bg-blue-50/80 backdrop-blur-sm text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  />
))
Alert.displayName = "Alert"

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-2 font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
AlertTitle.displayName = "AlertTitle"

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
))
AlertDescription.displayName = "AlertDescription"

export { Alert, AlertTitle, AlertDescription }

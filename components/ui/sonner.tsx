"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/95 group-[.toaster]:backdrop-blur-md group-[.toaster]:text-gray-900 group-[.toaster]:border-2 group-[.toaster]:border-gray-200/50 group-[.toaster]:shadow-xl group-[.toaster]:rounded-lg dark:group-[.toaster]:bg-gray-800/95 dark:group-[.toaster]:text-gray-100 dark:group-[.toaster]:border-gray-700/50",
          description: "group-[.toast]:text-gray-600 dark:group-[.toast]:text-gray-400",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-blue-600 group-[.toast]:to-purple-600 group-[.toast]:text-white group-[.toast]:rounded-md group-[.toast]:shadow-sm",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:rounded-md dark:group-[.toast]:bg-gray-700 dark:group-[.toast]:text-gray-300",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

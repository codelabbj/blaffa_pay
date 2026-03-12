'use client'
import { SignInForm } from "@/components/auth/sign-in-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/components/providers/language-provider"

export default function SignInPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [checking, setChecking] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check for accessToken cookie
    if (typeof document !== 'undefined') {
      const hasToken = document.cookie.split(';').some(cookie => cookie.trim().startsWith('accessToken='))
      if (hasToken) {
        router.push('/dashboard')
      } else {
        setChecking(false)
      }
    }
  }, [router])

  // Hydration guard: show generic loading on server, and translated loading on client after mount
  if (!mounted || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <span className="text-gray-700 dark:text-gray-200 text-lg">
          {mounted ? t("common.loading") : "Loading..."}
        </span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  )
}

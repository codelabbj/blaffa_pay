'use client'
import { SignInForm } from "@/components/auth/sign-in-form"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
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

  if (checking) {
    // Show a fallback UI while checking for the access token
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <span className="text-gray-700 dark:text-gray-200 text-lg">Loading...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <SignInForm />
    </div>
  )
}

"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { Zap, Eye, EyeOff, Mail, Lock, Shield, ArrowRight, Sparkles } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

// Colors for consistent theming
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981', 
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  success: '#22C55E',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
};

export function SignInForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const [showPassword, setShowPassword] = useState(false)
  const apiFetch = useApi();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await apiFetch(`${baseUrl}api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      if (!data || !data.access || !data.refresh || !data.user) {
        const backendError = extractErrorMessages(data) || t("auth.loginFailed")
        setError(backendError)
        toast({
          title: t("auth.loginFailed"),
          description: backendError,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      // Enforce staff/superuser-only access
      const user = data.user
      const isStaff = Boolean(user?.is_staff)
      const isSuperuser = Boolean(user?.is_superuser)
      if (!isStaff && !isSuperuser) {
        const notAllowedMsg = t("auth.notAllowed") || "User is not allowed to access this dashboard."
        setError(notAllowedMsg)
        toast({
          title: t("auth.loginFailed"),
          description: notAllowedMsg,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      localStorage.setItem("user", JSON.stringify(data.user))
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
        document.cookie = `accessToken=${data.access}; path=/; max-age=86400; secure; samesite=strict`;
      } else {
        localStorage.removeItem("rememberMe")
        document.cookie = `accessToken=${data.access}; path=/; secure; samesite=strict`;
      }
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.loggedInSuccessfully"),
      })
      router.push("/dashboard")
    } catch (err: any) {
      let backendError = t("auth.networkError");
      // Try to extract error message from API response
      if (err && err.message) {
        try {
          // Try to parse JSON from the error message if possible
          const parsed = JSON.parse(err.message);
          backendError = extractErrorMessages(parsed) || backendError;
        } catch {
          // If not JSON, try to extract from err.message directly
          backendError = extractErrorMessages(err.message) || backendError;
        }
      } else if (err) {
        backendError = extractErrorMessages(err) || backendError;
      }
      setError(backendError);
      toast({
        title: t("auth.networkError"),
        description: backendError,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          {/* <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.png" alt="Blaffa Pay Logo" className="h-16 w-16" />
                <div className="absolute -top-1 -right-1">
                  <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Blaffa Pay
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Admin Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div> */}
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {/* Blaffa Pay */}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              {/* {t("auth.subtitle")} */}
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl">
          <CardHeader className="space-y-4 pb-6">
            {/* <div className="flex items-center justify-center">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
                <Shield className="h-6 w-6 text-white" />
              </div>
            </div> */}
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
              {t("auth.welcome")} à Blaffa Pay
              
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Accédez à votre tableau de bord administrateur
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>{t("auth.email")}</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span>{t("auth.password")}</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-12 pr-12 py-3 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-300 dark:border-gray-600"
                  />
                  <Label htmlFor="remember" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                    {t("auth.rememberMe")}
                  </Label>
                </div>
                {/* <Button 
                  variant="link" 
                  className="px-0 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-200"
                >
                  {t("auth.forgotPassword")}
                </Button> */}
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{t("auth.loggingIn")}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>{t("auth.signIn")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="mt-4">
                  <ErrorDisplay
                    error={error}
                    variant="inline"
                    showRetry={false}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
                  />
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          {/* <div className="flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Shield className="h-4 w-4" />
            <span>Connexion sécurisée par chiffrement SSL</span>
          </div> */}
          <div className="text-xs text-gray-400 dark:text-gray-500">
            © 2025 Blaffa Pay. Tous droits réservés.
          </div>
        </div>
      </div>
    </div>
  )
}

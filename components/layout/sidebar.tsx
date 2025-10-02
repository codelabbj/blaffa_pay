"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import { BarChart3, Users, CreditCard, LogOut, Menu, X, Zap, ChevronDown, ChevronUp, Globe, Share2, Phone, Monitor, MessageCircle, Bell, Settings, Terminal, User, Home, DollarSign, Waves, Sparkles, Smartphone, ArrowUpDown, Gamepad2, Shield, Receipt } from "lucide-react"
import { clearTokens } from "@/lib/api"

// Colors for consistent theming - using logo colors
const COLORS = {
  primary: '#FF6B35', // Orange (primary from logo)
  secondary: '#00FF88', // Bright green from logo
  accent: '#1E3A8A', // Dark blue from logo
  danger: '#EF4444',
  warning: '#F97316',
  success: '#00FF88', // Using bright green for success
  info: '#1E3A8A', // Using dark blue for info
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
};

export function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false)
  const [devicesDropdownOpen, setDevicesDropdownOpen] = useState(false)
  const [networkConfigDropdownOpen, setNetworkConfigDropdownOpen] = useState(false)
  const [platformsDropdownOpen, setPlatformsDropdownOpen] = useState(false)
  const [permissionsDropdownOpen, setPermissionsDropdownOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  // Helper to check if a path is active or a child is active
  const isUsersActive = pathname.startsWith("/dashboard/users")
  const isRegisterActive = pathname === "/dashboard/users/register"
  const isListActive = pathname === "/dashboard/users/list"

  // Active logic for new dropdowns
  const isCountryActive = pathname.startsWith("/dashboard/country")
  const isCountryListActive = pathname === "/dashboard/country/list"
  const isCountryCreateActive = pathname === "/dashboard/country/create"

  const isNetworkActive = pathname.startsWith("/dashboard/network")
  const isNetworkListActive = pathname === "/dashboard/network/list"
  const isNetworkCreateActive = pathname === "/dashboard/network/create"

  const isDevicesActive = pathname.startsWith("/dashboard/devices")
  const isDevicesListActive = pathname === "/dashboard/devices/list"

  const isNetworkConfigActive = pathname.startsWith("/dashboard/network-config")
  const isNetworkConfigListActive = pathname === "/dashboard/network-config/list"
  const isNetworkConfigCreateActive = pathname === "/dashboard/network-config/create"

  const isPlatformsActive = pathname.startsWith("/dashboard/platforms")
  const isPlatformsListActive = pathname === "/dashboard/platforms/list"
  const isPlatformsCreateActive = pathname === "/dashboard/platforms/create"

  const isPermissionsActive = pathname.startsWith("/dashboard/permissions")
  const isPermissionsListActive = pathname === "/dashboard/permissions/list"
  const isPermissionsCreateActive = pathname === "/dashboard/permissions/create"

  const isBettingTransactionsActive = pathname.startsWith("/dashboard/betting-transactions")
  const isApiConfigActive = pathname.startsWith("/dashboard/api-config")
  const isPartnerPermissionsSummaryActive = pathname.startsWith("/dashboard/partner-permissions-summary")

  const handleLogout = () => {
    clearTokens();
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
    localStorage.removeItem("isAuthenticated");
    router.push("/");
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-gradient-to-b from-white via-orange-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 h-full min-h-0 shadow-2xl">
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.png" alt="Blaffa Pay Logo" className="h-12 w-12" />
                <div className="absolute -top-1 -right-1">
                  {/* <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div> */}
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  Blaffa Pay
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Dashboard
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto min-h-0">
            <Link
              href="/dashboard"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/dashboard"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.dashboard")}
            </Link>
            
            {/* Users Dropdown */}
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isUsersActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setUsersDropdownOpen((open) => !open)}
                aria-expanded={usersDropdownOpen}
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.users")}
                {usersDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  usersDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link
                  href="/dashboard/users/register"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                    isRegisterActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {t("nav.register")}
                </Link>
                <Link
                  href="/dashboard/users/list"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                    isListActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {t("nav.userList")}
                </Link>
              </div>
            </div>
            
            <Link
              href="/dashboard/transactions"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/dashboard/transactions"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <CreditCard className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.transactions")}
            </Link>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isCountryActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setCountryDropdownOpen((open) => !open)}
                aria-expanded={countryDropdownOpen}
              >
                <Globe className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.country")}
                {countryDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  countryDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/country/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isCountryListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.countryList")}</Link>
                <Link href="/dashboard/country/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isCountryCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.countryCreate")}</Link>
              </div>
            </div>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isNetworkActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setNetworkDropdownOpen((open) => !open)}
                aria-expanded={networkDropdownOpen}
              >
                <Share2 className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.network")}
                {networkDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  networkDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/network/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isNetworkListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.networkList")}</Link>
                <Link href="/dashboard/network/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isNetworkCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.networkCreate")}</Link>
              </div>
            </div>
            
            <Link href="/dashboard/phone-number/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/phone-number/list"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <Phone className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.phoneNumbers")}
            </Link>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isDevicesActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setDevicesDropdownOpen((open) => !open)}
                aria-expanded={devicesDropdownOpen}
              >
                <Monitor className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.devices")}
                {devicesDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  devicesDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/devices/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isDevicesListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.devicesList")}</Link>
              </div>
            </div>
            
            <Link href="/dashboard/sms-logs/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/sms-logs/list"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <MessageCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.smsLogs")}
            </Link>
            
            <Link href="/dashboard/fcm-logs/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/fcm-logs/list"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <Bell className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.fcmLogs")}
            </Link>
            
            <Link href="/dashboard/partner" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/partner"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.partner")}
            </Link>
            
            <Link href="/dashboard/partner-transfers" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/partner-transfers"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <ArrowUpDown className="mr-3 h-5 w-5 flex-shrink-0" />
              Transferts Partenaires
            </Link>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isPlatformsActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setPlatformsDropdownOpen((open) => !open)}
                aria-expanded={platformsDropdownOpen}
              >
                <Gamepad2 className="mr-3 h-5 w-5 flex-shrink-0" />
                Plateformes de Paris
                {platformsDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  platformsDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/platforms/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isPlatformsListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>Liste des Plateformes</Link>
                <Link href="/dashboard/platforms/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isPlatformsCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>Créer une Plateforme</Link>
              </div>
            </div>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isPermissionsActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setPermissionsDropdownOpen((open) => !open)}
                aria-expanded={permissionsDropdownOpen}
              >
                <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
                Permissions
                {permissionsDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  permissionsDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/permissions/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isPermissionsListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>Liste des Permissions</Link>
                <Link href="/dashboard/permissions/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isPermissionsCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>Créer une Permission</Link>
              </div>
            </div>
            
            <div>
              <Link href="/dashboard/betting-transactions" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isBettingTransactionsActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
              )}>
                <Receipt className="mr-3 h-5 w-5 flex-shrink-0" />
                Transactions de Paris
              </Link>
            </div>
            
            <div>
              <Link href="/dashboard/api-config" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isApiConfigActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
              )}>
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                Configuration API
              </Link>
            </div>
            
            <div>
              <Link href="/dashboard/partner-permissions-summary" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isPartnerPermissionsSummaryActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
              )}>
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                Résumé Permissions
              </Link>
            </div>
            
            <Link href="/dashboard/topup" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/topup"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <DollarSign className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("topup.title")}
            </Link>
            
            <Link href="/dashboard/earning-management" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/earning-management"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("earning.title")}
            </Link>
            
            <Link
              href="/dashboard/wave-business-transaction"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/dashboard/wave-business-transaction"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Waves className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("Wave Business Transaction")}
            </Link>
            
            <Link
              href="/dashboard/momo-pay"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/dashboard/momo-pay"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Smartphone className="mr-3 h-5 w-5 flex-shrink-0" />
              MoMo Pay
            </Link>
          </nav>
          
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gradient-to-b from-white via-orange-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 h-full min-h-0 shadow-xl">
          {/* Make sidebar scrollable if content overflows */}
          <div className="flex h-20 items-center px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.png" alt="Blaffa Pay Logo" className="h-12 w-12" />
                {/* <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div>
                </div> */}
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  Blaffa Pay
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin Dashboard
                </p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto min-h-0">
            <Link
              href="/dashboard"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/dashboard"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
              )}
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.dashboard")}
            </Link>
            
            {/* Users Dropdown */}
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isUsersActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setUsersDropdownOpen((open) => !open)}
                aria-expanded={usersDropdownOpen}
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.users")}
                {usersDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  usersDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link
                  href="/dashboard/users/register"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                    isRegisterActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  {t("nav.register")}
                </Link>
                <Link
                  href="/dashboard/users/list"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                    isListActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  {t("nav.userList")}
                </Link>
              </div>
            </div>
            
            <Link
              href="/dashboard/transactions"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/dashboard/transactions"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
              )}
            >
              <CreditCard className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.transactions")}
            </Link>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isCountryActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setCountryDropdownOpen((open) => !open)}
                aria-expanded={countryDropdownOpen}
              >
                <Globe className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.country")}
                {countryDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  countryDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/country/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isCountryListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.countryList")}</Link>
                <Link href="/dashboard/country/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isCountryCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.countryCreate")}</Link>
              </div>
            </div>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isNetworkActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setNetworkDropdownOpen((open) => !open)}
                aria-expanded={networkDropdownOpen}
              >
                <Share2 className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.network")}
                {networkDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  networkDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/network/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isNetworkListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.networkList")}</Link>
                <Link href="/dashboard/network/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isNetworkCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.networkCreate")}</Link>
              </div>
            </div>
            
            <Link href="/dashboard/phone-number/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/phone-number/list"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <Phone className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.phoneNumbers")}
            </Link>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isDevicesActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setDevicesDropdownOpen((open) => !open)}
                aria-expanded={devicesDropdownOpen}
              >
                <Monitor className="mr-3 h-5 w-5 flex-shrink-0" />
                {t("nav.devices")}
                {devicesDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  devicesDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/devices/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isDevicesListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>{t("nav.devicesList")}</Link>
              </div>
            </div>
            
            <Link href="/dashboard/sms-logs/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/sms-logs/list"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <MessageCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.smsLogs")}
            </Link>
            
            <Link href="/dashboard/fcm-logs/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/fcm-logs/list"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <Bell className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.fcmLogs")}
            </Link>
            
            <Link href="/dashboard/partner" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/partner"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("nav.partner")}
            </Link>
            
            <Link href="/dashboard/partner-transfers" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/partner-transfers"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <ArrowUpDown className="mr-3 h-5 w-5 flex-shrink-0" />
              Transferts Partenaires
            </Link>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isPlatformsActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setPlatformsDropdownOpen((open) => !open)}
                aria-expanded={platformsDropdownOpen}
              >
                <Gamepad2 className="mr-3 h-5 w-5 flex-shrink-0" />
                Plateformes de Paris
                {platformsDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  platformsDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/platforms/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isPlatformsListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>Liste des Plateformes</Link>
                <Link href="/dashboard/platforms/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isPlatformsCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>Créer une Plateforme</Link>
              </div>
            </div>
            
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                  isPermissionsActive
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                    : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
                )}
                onClick={() => setPermissionsDropdownOpen((open) => !open)}
                aria-expanded={permissionsDropdownOpen}
              >
                <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
                Permissions
                {permissionsDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-all duration-300",
                  permissionsDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/permissions/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isPermissionsListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>Liste des Permissions</Link>
                <Link href="/dashboard/permissions/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-all duration-200",
                  isPermissionsCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>Créer une Permission</Link>
              </div>
            </div>
            
            <div>
              <Link href="/dashboard/betting-transactions" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isBettingTransactionsActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
              )}>
                <Receipt className="mr-3 h-5 w-5 flex-shrink-0" />
                Transactions de Paris
              </Link>
            </div>
            
            <div>
              <Link href="/dashboard/api-config" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isApiConfigActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
              )}>
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                Configuration API
              </Link>
            </div>
            
            <div>
              <Link href="/dashboard/partner-permissions-summary" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                isPartnerPermissionsSummaryActive
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md"
              )}>
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                Résumé Permissions
              </Link>
            </div>
            
            <Link href="/dashboard/topup" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/topup"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <DollarSign className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("topup.title")}
            </Link>
            
            <Link href="/dashboard/earning-management" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
              pathname === "/dashboard/earning-management"
                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
            )}>
              <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("earning.title")}
            </Link>
            
            <Link
              href="/dashboard/wave-business-transaction"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/dashboard/wave-business-transaction"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Waves className="mr-3 h-5 w-5 flex-shrink-0" />
              {t("Wave Business Transaction")}
            </Link>
            
            <Link
              href="/dashboard/momo-pay"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200",
                pathname === "/dashboard/momo-pay"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                  : "text-gray-700 hover:bg-white/80 dark:text-gray-300 dark:hover:bg-gray-800/80 hover:shadow-md",
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <Smartphone className="mr-3 h-5 w-5 flex-shrink-0" />
              MoMo Pay
            </Link>
          </nav>
          
          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200" 
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="lg:hidden">
        <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg border border-gray-200/50 dark:border-gray-700/50" onClick={() => setSidebarOpen(true)}>
          <Menu className="h-10 w-10" />
        </Button>
      </div>
    </>
  )
}

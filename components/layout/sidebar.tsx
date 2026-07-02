"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import { BarChart3, Users, CreditCard, LogOut, Menu, X, Zap, ChevronDown, ChevronUp, Globe, Share2, Phone, Monitor, MessageCircle, Bell, Settings, Terminal, User, Home, DollarSign, Waves, Sparkles, Smartphone, ArrowUpDown, Gamepad2, Shield, Receipt, ShieldCheck, Layers, Send } from "lucide-react"
import { clearTokens } from "@/lib/api"
import { FeatureGate } from "@/components/feature-gate"
import { getAppLogo, getAppName, getAppTagline } from "@/lib/env-config"

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

interface SidebarProps {
  mobileSidebarOpen?: boolean
  onToggleMobileSidebar?: () => void
}

export function Sidebar({ mobileSidebarOpen = false, onToggleMobileSidebar }: SidebarProps) {
  const [usersDropdownOpen, setUsersDropdownOpen] = useState(false)
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false)
  const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false)
  const [devicesDropdownOpen, setDevicesDropdownOpen] = useState(false)
  const [networkConfigDropdownOpen, setNetworkConfigDropdownOpen] = useState(false)
  const [platformsDropdownOpen, setPlatformsDropdownOpen] = useState(false)
  const [permissionsDropdownOpen, setPermissionsDropdownOpen] = useState(false)
  const [aggregatorsDropdownOpen, setAggregatorsDropdownOpen] = useState(false)
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
  const isFlashPayDevicesActive = pathname.startsWith("/dashboard/devices/flashpay")
  const isOutboundSmsActive = pathname.startsWith("/dashboard/sms-outbound")

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
  const isBulkDepositNetworksActive = pathname.startsWith("/dashboard/bulk-deposit-networks")
  const isDeviceAuthorizationsActive = pathname.startsWith("/dashboard/device-authorizations")
  const isAggregatorsActive = pathname.startsWith("/dashboard/aggregators")

  const appName = getAppName()
  const appTagline = getAppTagline()
  const appLogo = getAppLogo()

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
      <div className={cn("fixed inset-0 z-50 lg:hidden", mobileSidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/50" onClick={onToggleMobileSidebar} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white dark:bg-gray-900 h-full min-h-0 border-r border-gray-200/50 dark:border-gray-700/50">
          <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src={appLogo} alt={`${appName} Logo`} className="h-12 w-12" />
                <div className="absolute -top-1 -right-1">
                  {/* <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div> */}
                </div>
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  {appName}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {appTagline}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onToggleMobileSidebar} className="hover:bg-gray-100 dark:hover:bg-gray-700">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto min-h-0">
            <FeatureGate feature="dashboard">
            <Link
              href="/dashboard"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                pathname === "/dashboard"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.dashboard")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="users">
            {/* Users Dropdown */}
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isUsersActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setUsersDropdownOpen((open) => !open)}
                aria-expanded={usersDropdownOpen}
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{t("nav.users")}</span>
                {usersDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  usersDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link
                  href="/dashboard/users/register"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    isRegisterActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                  onClick={onToggleMobileSidebar}
                >
                  <span><span>{t("nav.register")}</span></span>
                </Link>
                <Link
                  href="/dashboard/users/list"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    isListActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                  onClick={onToggleMobileSidebar}
                >
                  <span><span>{t("nav.userList")}</span></span>
                </Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="transactions">
            <Link
              href="/dashboard/transactions"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                pathname === "/dashboard/transactions"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <CreditCard className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("nav.transactions")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="outboundSms">
            <Link
              href="/dashboard/sms-outbound"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isOutboundSmsActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <Send className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.outboundSms")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="bulkDepositNetworks">
            <Link
              href="/dashboard/bulk-deposit-networks"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isBulkDepositNetworksActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("nav.bulkDepositNetworks")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="deviceAuthorizations">
            <Link
              href="/dashboard/device-authorizations"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isDeviceAuthorizationsActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <ShieldCheck className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("nav.deviceAuthorizations")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="aggregators">
            {/* Aggregators Dropdown */}
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isAggregatorsActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setAggregatorsDropdownOpen((open) => !open)}
                aria-expanded={aggregatorsDropdownOpen}
              >
                <Layers className="mr-3 h-5 w-5 flex-shrink-0" />
                <span><span>{t("nav.aggregators")}</span></span>
                {aggregatorsDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  aggregatorsDropdownOpen ? "max-h-[22rem] opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >

                <Link
                  href="/dashboard/aggregators/users"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    pathname.startsWith("/dashboard/aggregators/users")
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                  onClick={onToggleMobileSidebar}
                >
                  <span><span>{t("nav.aggregatorUsers")}</span></span>
                </Link>
                <Link
                  href="/dashboard/aggregators/authorizations"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    pathname === "/dashboard/aggregators/authorizations"
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                  onClick={onToggleMobileSidebar}
                >
                  <span><span>{t("nav.aggregatorAuthorizations")}</span></span>
                </Link>
                <Link
                  href="/dashboard/aggregators/network-mappings"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    pathname === "/dashboard/aggregators/network-mappings"
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                  onClick={onToggleMobileSidebar}
                >
                  <span><span>{t("nav.aggregatorNetworkMappings")}</span></span>
                </Link>
                <Link
                  href="/dashboard/aggregators/transactions"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    pathname === "/dashboard/aggregators/transactions"
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                  onClick={onToggleMobileSidebar}
                >
                  <span><span>{t("nav.aggregatorTransactions")}</span></span>
                </Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="country">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isCountryActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setCountryDropdownOpen((open) => !open)}
                aria-expanded={countryDropdownOpen}
              >
                <Globe className="mr-3 h-5 w-5 flex-shrink-0" />
                <span><span>{t("nav.country")}</span></span>
                {countryDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  countryDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/country/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isCountryListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span><span>{t("nav.countryList")}</span></span></Link>
                <Link href="/dashboard/country/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isCountryCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span><span>{t("nav.countryCreate")}</span></span></Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="network">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isNetworkActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setNetworkDropdownOpen((open) => !open)}
                aria-expanded={networkDropdownOpen}
              >
                <Share2 className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{t("nav.network")}</span>
                {networkDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  networkDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/network/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isNetworkListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>{t("nav.networkList")}</span></Link>
                <Link href="/dashboard/network/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isNetworkCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span><span>{t("nav.networkCreate")}</span></span></Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="phoneNumbers">
            <Link href="/dashboard/phone-number/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/phone-number/list"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <Phone className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.phoneNumbers")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="devices">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isDevicesActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setDevicesDropdownOpen((open) => !open)}
                aria-expanded={devicesDropdownOpen}
              >
                <Monitor className="mr-3 h-5 w-5 flex-shrink-0" />
                <span><span>{t("nav.devices")}</span></span>
                {devicesDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  devicesDropdownOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/devices/flashpay" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isFlashPayDevicesActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>FlashPay (config)</Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="smsLogs">
            <Link href="/dashboard/sms-logs/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/sms-logs/list"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <MessageCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.smsLogs")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="fcmLogs">
            <Link href="/dashboard/fcm-logs/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/fcm-logs/list"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <Bell className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.fcmLogs")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="partner">
            <Link href="/dashboard/partner" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/partner"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.partner")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="partnerTransfers">
            <Link href="/dashboard/partner-transfers" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/partner-transfers"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <ArrowUpDown className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>Transferts Partenaires</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="platforms">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isPlatformsActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  platformsDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/platforms/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isPlatformsListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>Liste des Plateformes</span></Link>
                <Link href="/dashboard/platforms/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isPlatformsCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>Créer une Plateforme</span></Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="permissions">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isPermissionsActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  permissionsDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/permissions/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isPermissionsListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>Liste des Permissions</span></Link>
                <Link href="/dashboard/permissions/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isPermissionsCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>Créer une Permission</span></Link>
              </div>
            </div>
            </FeatureGate>

            <div>
            <FeatureGate feature="bettingTransactions">
              <Link href="/dashboard/betting-transactions" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isBettingTransactionsActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}>
                <Receipt className="mr-3 h-5 w-5 flex-shrink-0" />
                Transactions de Paris
              </Link>
            </FeatureGate>
            </div>

            <FeatureGate feature="apiConfigPage">
            <div>
              <Link href="/dashboard/api-config" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isApiConfigActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}>
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                Configuration API
              </Link>
            </div>
            </FeatureGate>

            <div>
            <FeatureGate feature="partnerPermissionsSummary">
              <Link href="/dashboard/partner-permissions-summary" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isPartnerPermissionsSummaryActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}>
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                Résumé Permissions
              </Link>
            </FeatureGate>
            </div>

            <FeatureGate feature="topup">
            <Link href="/dashboard/topup" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/topup"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <DollarSign className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("topup.title")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="earningManagement">
            <Link href="/dashboard/earning-management" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/earning-management"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("earning.title")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="waveBusiness">
            <Link
              href="/dashboard/wave-business-transaction"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                pathname === "/dashboard/wave-business-transaction"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <Waves className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("Wave Business Transaction")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="momoPay">
            <Link
              href="/dashboard/momo-pay"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                pathname === "/dashboard/momo-pay"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <Smartphone className="mr-3 h-5 w-5 flex-shrink-0" />
              MoMo Pay
            </Link>
            </FeatureGate>
          </nav>

          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-150"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col lg:w-72">
        <div className="flex flex-col flex-grow bg-white dark:bg-gray-900 border-r border-gray-200/50 dark:border-gray-700/50 h-full min-h-0">
          {/* Make sidebar scrollable if content overflows */}
          <div className="flex h-20 items-center px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src={appLogo} alt={`${appName} Logo`} className="h-12 w-12" />
                {/* <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 bg-gradient-to-r from-orange-400 to-green-500 rounded-full flex items-center justify-center">
                    <Sparkles className="h-2.5 w-2.5 text-white" />
                  </div>
                </div> */}
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  {appName}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {appTagline}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 space-y-2 px-4 py-6 overflow-y-auto min-h-0">
            <FeatureGate feature="dashboard">
            <Link
              href="/dashboard"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                pathname === "/dashboard"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <Home className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.dashboard")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="users">
            {/* Users Dropdown */}
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isUsersActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setUsersDropdownOpen((open) => !open)}
                aria-expanded={usersDropdownOpen}
              >
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{t("nav.users")}</span>
                {usersDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  usersDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link
                  href="/dashboard/users/register"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    isRegisterActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <span><span>{t("nav.register")}</span></span>
                </Link>
                <Link
                  href="/dashboard/users/list"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    isListActive
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <span><span>{t("nav.userList")}</span></span>
                </Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="transactions">
            <Link
              href="/dashboard/transactions"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                pathname === "/dashboard/transactions"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <CreditCard className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("nav.transactions")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="outboundSms">
            <Link
              href="/dashboard/sms-outbound"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isOutboundSmsActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <Send className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.outboundSms")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="bulkDepositNetworks">
            <Link
              href="/dashboard/bulk-deposit-networks"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isBulkDepositNetworksActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("nav.bulkDepositNetworks")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="deviceAuthorizations">
            <Link
              href="/dashboard/device-authorizations"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isDeviceAuthorizationsActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
            >
              <ShieldCheck className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("nav.deviceAuthorizations")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="aggregators">
            {/* Aggregators Dropdown */}
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isAggregatorsActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setAggregatorsDropdownOpen((open) => !open)}
                aria-expanded={aggregatorsDropdownOpen}
              >
                <Layers className="mr-3 h-5 w-5 flex-shrink-0" />
                <span><span>{t("nav.aggregators")}</span></span>
                {aggregatorsDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  aggregatorsDropdownOpen ? "max-h-[22rem] opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >

                <Link
                  href="/dashboard/aggregators/users"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    pathname.startsWith("/dashboard/aggregators/users")
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <span><span>{t("nav.aggregatorUsers")}</span></span>
                </Link>
                <Link
                  href="/dashboard/aggregators/authorizations"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    pathname === "/dashboard/aggregators/authorizations"
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <span><span>{t("nav.aggregatorAuthorizations")}</span></span>
                </Link>
                <Link
                  href="/dashboard/aggregators/network-mappings"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    pathname === "/dashboard/aggregators/network-mappings"
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <span><span>{t("nav.aggregatorNetworkMappings")}</span></span>
                </Link>
                <Link
                  href="/dashboard/aggregators/transactions"
                  className={cn(
                    "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                    pathname === "/dashboard/aggregators/transactions"
                      ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  )}
                >
                  <span><span>{t("nav.aggregatorTransactions")}</span></span>
                </Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="country">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isCountryActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setCountryDropdownOpen((open) => !open)}
                aria-expanded={countryDropdownOpen}
              >
                <Globe className="mr-3 h-5 w-5 flex-shrink-0" />
                <span><span>{t("nav.country")}</span></span>
                {countryDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  countryDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/country/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isCountryListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span><span>{t("nav.countryList")}</span></span></Link>
                <Link href="/dashboard/country/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isCountryCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span><span>{t("nav.countryCreate")}</span></span></Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="network">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isNetworkActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setNetworkDropdownOpen((open) => !open)}
                aria-expanded={networkDropdownOpen}
              >
                <Share2 className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{t("nav.network")}</span>
                {networkDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  networkDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/network/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isNetworkListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>{t("nav.networkList")}</span></Link>
                <Link href="/dashboard/network/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isNetworkCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>{t("nav.networkCreate")}</span></Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="phoneNumbers">
            <Link href="/dashboard/phone-number/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/phone-number/list"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <Phone className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.phoneNumbers")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="devices">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isDevicesActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setDevicesDropdownOpen((open) => !open)}
                aria-expanded={devicesDropdownOpen}
              >
                <Monitor className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>{t("nav.devices")}</span>
                {devicesDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  devicesDropdownOpen ? "max-h-40 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/devices/flashpay" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isFlashPayDevicesActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}>FlashPay (config)</Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="smsLogs">
            <Link href="/dashboard/sms-logs/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/sms-logs/list"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <MessageCircle className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.smsLogs")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="fcmLogs">
            <Link href="/dashboard/fcm-logs/list" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/fcm-logs/list"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <Bell className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.fcmLogs")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="partner">
            <Link href="/dashboard/partner" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/partner"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <User className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>{t("nav.partner")}</span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="partnerTransfers">
            <Link href="/dashboard/partner-transfers" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/partner-transfers"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <ArrowUpDown className="mr-3 h-5 w-5 flex-shrink-0" />
              Transferts Partenaires
            </Link>
            </FeatureGate>

            <FeatureGate feature="platforms">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isPlatformsActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
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
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  platformsDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/platforms/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isPlatformsListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>Liste des Plateformes</span></Link>
                <Link href="/dashboard/platforms/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isPlatformsCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>Créer une Plateforme</span></Link>
              </div>
            </div>
            </FeatureGate>

            <FeatureGate feature="permissions">
            <div>
              <button
                className={cn(
                  "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                  isPermissionsActive
                    ? "bg-orange-500 text-white"
                    : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setPermissionsDropdownOpen((open) => !open)}
                aria-expanded={permissionsDropdownOpen}
              >
                <Shield className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Permissions</span>
                {permissionsDropdownOpen ? (
                  <ChevronUp className="ml-auto h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-auto h-4 w-4" />
                )}
              </button>
              <div
                className={cn(
                  "pl-8 flex flex-col gap-1 overflow-hidden transition-[max-height,opacity] duration-200",
                  permissionsDropdownOpen ? "max-h-32 opacity-100 mt-2" : "max-h-0 opacity-0 pointer-events-none"
                )}
              >
                <Link href="/dashboard/permissions/list" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isPermissionsListActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>Liste des Permissions</span></Link>
                <Link href="/dashboard/permissions/create" className={cn(
                  "block px-4 py-2 text-sm rounded-lg transition-colors duration-150",
                  isPermissionsCreateActive
                    ? "bg-orange-100 text-orange-900 dark:bg-orange-900/20 dark:text-orange-300 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                )}><span>Créer une Permission</span></Link>
              </div>
            </div>
            </FeatureGate>

            <div>
            <FeatureGate feature="bettingTransactions">
              <Link href="/dashboard/betting-transactions" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isBettingTransactionsActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}>
                <Receipt className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Transactions de Paris</span>
              </Link>
            </FeatureGate>
            </div>

            <FeatureGate feature="apiConfigPage">
            <div>
              <Link href="/dashboard/api-config" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isApiConfigActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}>
                <Settings className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Configuration API</span>
              </Link>
            </div>
            </FeatureGate>

            <div>
            <FeatureGate feature="partnerPermissionsSummary">
              <Link href="/dashboard/partner-permissions-summary" className={cn(
                "group flex items-center w-full px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                isPartnerPermissionsSummaryActive
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              )}>
                <Users className="mr-3 h-5 w-5 flex-shrink-0" />
                <span>Résumé Permissions</span>
              </Link>
            </FeatureGate>
            </div>

            <FeatureGate feature="topup">
            <Link href="/dashboard/topup" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/topup"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <DollarSign className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("topup.title")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="earningManagement">
            <Link href="/dashboard/earning-management" className={cn(
              "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
              pathname === "/dashboard/earning-management"
                ? "bg-orange-500 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
            )}>
              <BarChart3 className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("earning.title")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="waveBusiness">
            <Link
              href="/dashboard/wave-business-transaction"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                pathname === "/dashboard/wave-business-transaction"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <Waves className="mr-3 h-5 w-5 flex-shrink-0" />
              <span><span>{t("Wave Business Transaction")}</span></span>
            </Link>
            </FeatureGate>

            <FeatureGate feature="momoPay">
            <Link
              href="/dashboard/momo-pay"
              className={cn(
                "group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150",
                pathname === "/dashboard/momo-pay"
                  ? "bg-orange-500 text-white"
                  : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
              )}
              onClick={onToggleMobileSidebar}
            >
              <Smartphone className="mr-3 h-5 w-5 flex-shrink-0" />
              <span>MoMo Pay</span>
            </Link>
            </FeatureGate>
          </nav>

          <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-xl transition-colors duration-150"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>{t("nav.logout")}</span>
            </Button>
          </div>
        </div>
      </div>

    </>
  )
}

/**
 * Configuration centralisée Blaffa Pay (variables d'environnement).
 *
 * Feature flags : absent ou vide → true (tout activé par défaut).
 * Mettre "false" pour désactiver une section du dashboard.
 */

/** Parse une variable booléenne (.env). Défaut: true si absente. */
export function envBool(raw: string | undefined, defaultValue = true): boolean {
  if (raw === undefined || raw.trim() === "") return defaultValue
  const v = raw.trim().toLowerCase()
  if (["false", "0", "no", "off"].includes(v)) return false
  if (["true", "1", "yes", "on"].includes(v)) return true
  return defaultValue
}

/** Nettoie une URL de base : trim + retire les slashes finaux. */
export function normalizeApiBase(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/\/+$/, "")
}

/**
 * URL de base API sans slash final.
 * Préférer apiUrl() pour construire les URLs complètes.
 */
export function getApiBaseUrl(): string {
  return normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE_URL)
}

/**
 * Joint intelligemment base + chemin :
 * - ajoute le slash manquant entre les deux
 * - retire les slashes en trop saisis par l'utilisateur
 */
export function apiUrl(path: string): string {
  const base = normalizeApiBase(process.env.NEXT_PUBLIC_API_BASE_URL)
  const normalizedPath = path.trim().replace(/^\/+/, "")
  if (!base) return `/${normalizedPath}`
  return `${base}/${normalizedPath}`
}

// --- Branding (white-label) ---

export function getAppName(): string {
  return (process.env.NEXT_PUBLIC_APP_NAME || "Blaffa Pay").trim()
}

export function getAppTagline(): string {
  return (process.env.NEXT_PUBLIC_APP_TAGLINE || "Admin Dashboard").trim()
}

export function getAppLogo(): string {
  return (process.env.NEXT_PUBLIC_APP_LOGO || "/logo.png").trim()
}

export function getAppShortName(): string {
  const raw = process.env.NEXT_PUBLIC_APP_SHORT_NAME?.trim()
  if (raw) return raw
  return getAppName()
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "AP"
}

export function getAppCopyright(): string {
  const custom = process.env.NEXT_PUBLIC_APP_COPYRIGHT?.trim()
  if (custom) return custom
  const year = process.env.NEXT_PUBLIC_APP_COPYRIGHT_YEAR?.trim() || String(new Date().getFullYear())
  return `© ${year} ${getAppName()}. Tous droits réservés.`
}

export function getApiToken(): string {
  return process.env.NEXT_PUBLIC_API_TOKEN || ""
}

export function getWsUrl(): string {
  const raw = process.env.NEXT_PUBLIC_WS_URL?.trim()
  if (!raw) return "wss://connect.yapson.net/ws/payment/"
  return raw.endsWith("/") ? raw : `${raw}/`
}

export const apiConfig = {
  get baseUrl() {
    return getApiBaseUrl()
  },
  get token() {
    return getApiToken()
  },
  get wsUrl() {
    return getWsUrl()
  },
} as const

export const features = {
  dashboard: envBool(process.env.NEXT_PUBLIC_FEATURE_DASHBOARD),
  users: envBool(process.env.NEXT_PUBLIC_FEATURE_USERS),
  transactions: envBool(process.env.NEXT_PUBLIC_FEATURE_TRANSACTIONS),
  bulkDepositNetworks: envBool(process.env.NEXT_PUBLIC_FEATURE_BULK_DEPOSIT_NETWORKS),
  deviceAuthorizations: envBool(process.env.NEXT_PUBLIC_FEATURE_DEVICE_AUTHORIZATIONS),
  aggregators: envBool(process.env.NEXT_PUBLIC_FEATURE_AGGREGATORS),
  country: envBool(process.env.NEXT_PUBLIC_FEATURE_COUNTRY),
  network: envBool(process.env.NEXT_PUBLIC_FEATURE_NETWORK),
  networkConfig: envBool(process.env.NEXT_PUBLIC_FEATURE_NETWORK_CONFIG),
  phoneNumbers: envBool(process.env.NEXT_PUBLIC_FEATURE_PHONE_NUMBERS),
  devices: envBool(process.env.NEXT_PUBLIC_FEATURE_DEVICES),
  smsLogs: envBool(process.env.NEXT_PUBLIC_FEATURE_SMS_LOGS),
  fcmLogs: envBool(process.env.NEXT_PUBLIC_FEATURE_FCM_LOGS),
  partner: envBool(process.env.NEXT_PUBLIC_FEATURE_PARTNER),
  partnerTransfers: envBool(process.env.NEXT_PUBLIC_FEATURE_PARTNER_TRANSFERS),
  platforms: envBool(process.env.NEXT_PUBLIC_FEATURE_PLATFORMS),
  permissions: envBool(process.env.NEXT_PUBLIC_FEATURE_PERMISSIONS),
  bettingTransactions: envBool(process.env.NEXT_PUBLIC_FEATURE_BETTING_TRANSACTIONS),
  apiConfigPage: envBool(process.env.NEXT_PUBLIC_FEATURE_API_CONFIG),
  partnerPermissionsSummary: envBool(process.env.NEXT_PUBLIC_FEATURE_PARTNER_PERMISSIONS_SUMMARY),
  topup: envBool(process.env.NEXT_PUBLIC_FEATURE_TOPUP),
  earningManagement: envBool(process.env.NEXT_PUBLIC_FEATURE_EARNING_MANAGEMENT),
  waveBusiness: envBool(process.env.NEXT_PUBLIC_FEATURE_WAVE_BUSINESS),
  momoPay: envBool(process.env.NEXT_PUBLIC_FEATURE_MOMO_PAY),
  transactionLogs: envBool(process.env.NEXT_PUBLIC_FEATURE_TRANSACTION_LOGS),
  remoteCommand: envBool(process.env.NEXT_PUBLIC_FEATURE_REMOTE_COMMAND),
  websocket: envBool(process.env.NEXT_PUBLIC_FEATURE_WEBSOCKET),
  profile: envBool(process.env.NEXT_PUBLIC_FEATURE_PROFILE),
} as const

export type FeatureKey = keyof typeof features

/** Préfixes de routes → feature (middleware). Ordre : plus long en premier. */
export const routeFeatureMap: { prefix: string; feature: FeatureKey }[] = [
  { prefix: "/dashboard/partner-permissions-summary", feature: "partnerPermissionsSummary" },
  { prefix: "/dashboard/partner-transfers", feature: "partnerTransfers" },
  { prefix: "/dashboard/bulk-deposit-networks", feature: "bulkDepositNetworks" },
  { prefix: "/dashboard/device-authorizations", feature: "deviceAuthorizations" },
  { prefix: "/dashboard/betting-transactions", feature: "bettingTransactions" },
  { prefix: "/dashboard/wave-business-transaction", feature: "waveBusiness" },
  { prefix: "/dashboard/network-config", feature: "networkConfig" },
  { prefix: "/dashboard/transaction-logs", feature: "transactionLogs" },
  { prefix: "/dashboard/remote-command", feature: "remoteCommand" },
  { prefix: "/dashboard/earning-management", feature: "earningManagement" },
  { prefix: "/dashboard/aggregators", feature: "aggregators" },
  { prefix: "/dashboard/transactions", feature: "transactions" },
  { prefix: "/dashboard/permissions", feature: "permissions" },
  { prefix: "/dashboard/phone-number", feature: "phoneNumbers" },
  { prefix: "/dashboard/platforms", feature: "platforms" },
  { prefix: "/dashboard/api-config", feature: "apiConfigPage" },
  { prefix: "/dashboard/sms-logs", feature: "smsLogs" },
  { prefix: "/dashboard/fcm-logs", feature: "fcmLogs" },
  { prefix: "/dashboard/users", feature: "users" },
  { prefix: "/dashboard/country", feature: "country" },
  { prefix: "/dashboard/network", feature: "network" },
  { prefix: "/dashboard/devices", feature: "devices" },
  { prefix: "/dashboard/partner", feature: "partner" },
  { prefix: "/dashboard/topup", feature: "topup" },
  { prefix: "/dashboard/momo-pay", feature: "momoPay" },
  { prefix: "/dashboard/profile", feature: "profile" },
]

const sortedRouteMap = [...routeFeatureMap].sort((a, b) => b.prefix.length - a.prefix.length)

export function getFeatureForPath(pathname: string): FeatureKey | null {
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return "dashboard"
  }
  for (const { prefix, feature } of sortedRouteMap) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return feature
    }
  }
  return null
}

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return features[feature]
}

export function isRouteEnabled(pathname: string): boolean {
  const feature = getFeatureForPath(pathname)
  return feature ? features[feature] : true
}

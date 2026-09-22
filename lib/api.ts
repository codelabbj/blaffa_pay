// Aligné sur SIMPLE_JWT ACCESS_TOKEN_LIFETIME (300 jours).
const ACCESS_COOKIE_MAX_AGE_SEC = 300 * 24 * 60 * 60

function cookieSecureFlag(): string {
  if (typeof window === "undefined") return ""
  return window.location.protocol === "https:" ? "; Secure" : ""
}

export function setAccessCookie(access: string) {
  if (typeof document === "undefined" || !access) return
  document.cookie =
    `accessToken=${access}; path=/; max-age=${ACCESS_COOKIE_MAX_AGE_SEC}; SameSite=Lax${cookieSecureFlag()}`
}

export function clearAccessCookie() {
  if (typeof document === "undefined") return
  document.cookie =
    `accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${cookieSecureFlag()}`
}

function getAccessToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("accessToken")
}

function getRefreshToken() {
  if (typeof window === "undefined") return null
  return localStorage.getItem("refreshToken")
}

function setTokens({ access, refresh }: { access: string; refresh?: string | null }) {
  if (access) {
    localStorage.setItem("accessToken", access)
    setAccessCookie(access)
  }
  if (refresh) {
    localStorage.setItem("refreshToken", refresh)
  }
}

function clearTokens() {
  localStorage.removeItem("accessToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
  localStorage.removeItem("rememberMe")
  localStorage.removeItem("theme")
  localStorage.removeItem("isAuthenticated")
  clearAccessCookie()
}

export { getAccessToken, getRefreshToken, setTokens, clearTokens }

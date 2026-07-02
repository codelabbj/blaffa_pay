import { apiUrl, getApiBaseUrl } from "@/lib/env-config"
import type { OutboundSmsJob } from "@/lib/flashpay-device-api"

export type OutboundSmsStatus = OutboundSmsJob["status"]

export type SendOutboundSmsParams = {
  /** Numéro destinataire (ex. +22670123456 ou 070123456) */
  to: string
  /** Contenu du SMS */
  message: string
  /**
   * Token API connect_pro :
   * - `cpk_xxx:cps_yyy`
   * - ou `ApiKey cpk_xxx:cps_yyy`
   */
  token: string
  /** URL API (défaut : NEXT_PUBLIC_API_BASE_URL) */
  baseUrl?: string
  /** UUID device émetteur (optionnel — prioritaire si renseigné) */
  deviceUid?: string
  /** UUID réseau MoMo (Orange, Moov, MTN…) — route vers le bon téléphone */
  networkUid?: string
  /** Clé anti-doublon (recommandé pour OTP) */
  idempotencyKey?: string
  metadata?: Record<string, unknown>
  /** Attendre que le SMS soit envoyé ou échoué (poll statut) */
  waitForDelivery?: boolean
  pollIntervalMs?: number
  pollTimeoutMs?: number
}

export type SendOutboundSmsResult = {
  job: OutboundSmsJob
  delivered: boolean
}

export class OutboundSmsError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly body?: unknown,
  ) {
    super(message)
    this.name = "OutboundSmsError"
  }
}

/** Formate le header Authorization ApiKey. */
export function formatApiKeyToken(token: string): string {
  const trimmed = token.trim()
  if (!trimmed) throw new OutboundSmsError("Token API vide")
  if (trimmed.toLowerCase().startsWith("apikey ")) return trimmed
  if (!trimmed.includes(":")) {
    throw new OutboundSmsError(
      'Token invalide — format attendu : "cpk_xxx:cps_yyy" ou "ApiKey cpk_xxx:cps_yyy"',
    )
  }
  return `ApiKey ${trimmed}`
}

function resolveBaseUrl(baseUrl?: string): string {
  const raw = (baseUrl ?? getApiBaseUrl()).trim().replace(/\/+$/, "")
  if (!raw) {
    throw new OutboundSmsError(
      "baseUrl manquant — passe baseUrl ou définis NEXT_PUBLIC_API_BASE_URL",
    )
  }
  return raw
}

function joinUrl(base: string, path: string): string {
  const p = path.replace(/^\/+/, "")
  return `${base}/${p}`
}

async function apiKeyFetch<T>(
  baseUrl: string,
  token: string,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const url = joinUrl(baseUrl, path.startsWith("api/") ? path : `api/${path}`)
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: formatApiKeyToken(token),
      ...(init?.headers ?? {}),
    },
  })

  let body: unknown = null
  const text = await res.text()
  if (text) {
    try {
      body = JSON.parse(text)
    } catch {
      body = text
    }
  }

  if (!res.ok) {
    const msg =
      typeof body === "object" && body !== null && "detail" in body
        ? String((body as { detail: unknown }).detail)
        : typeof body === "object" && body !== null && "error" in body
          ? String((body as { error: unknown }).error)
          : `Erreur HTTP ${res.status}`
    throw new OutboundSmsError(msg, res.status, body)
  }

  return body as T
}

/** Crée une demande d'envoi SMS (file FlashPay). */
export async function createOutboundSmsWithToken(
  params: Omit<
    SendOutboundSmsParams,
    "waitForDelivery" | "pollIntervalMs" | "pollTimeoutMs"
  >,
): Promise<OutboundSmsJob> {
  const baseUrl = resolveBaseUrl(params.baseUrl)
  const payload: Record<string, unknown> = {
    to_phone: params.to.trim(),
    message: params.message.trim(),
  }
  if (params.deviceUid) payload.device = params.deviceUid
  if (params.networkUid) payload.network = params.networkUid
  if (params.idempotencyKey) payload.idempotency_key = params.idempotencyKey
  if (params.metadata) payload.metadata = params.metadata

  return apiKeyFetch<OutboundSmsJob>(baseUrl, params.token, "payments/outbound-sms/", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

/** Lit le statut d'un job SMS. */
export async function getOutboundSmsStatus(
  jobUid: string,
  opts: { token: string; baseUrl?: string },
): Promise<OutboundSmsJob> {
  const baseUrl = resolveBaseUrl(opts.baseUrl)
  return apiKeyFetch<OutboundSmsJob>(
    baseUrl,
    opts.token,
    `payments/outbound-sms/${jobUid}/`,
    { method: "GET" },
  )
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Envoie un SMS sortant via l'API connect_pro (token ApiKey).
 *
 * @example
 * ```ts
 * const { job, delivered } = await sendOutboundSms({
 *   to: "+22670123456",
 *   message: "Votre code : 4821",
 *   token: "cpk_xxx:cps_yyy",
 *   baseUrl: "https://connect.cenof.finance",
 *   idempotencyKey: "otp-user-42",
 *   networkUid: "uuid-reseau-orange",  // optionnel si plusieurs devices
 *   waitForDelivery: true,
 * })
 * ```
 */
export async function sendOutboundSms(
  params: SendOutboundSmsParams,
): Promise<SendOutboundSmsResult> {
  const job = await createOutboundSmsWithToken(params)

  if (!params.waitForDelivery) {
    return { job, delivered: job.status === "sent" }
  }

  const interval = params.pollIntervalMs ?? 2000
  const timeout = params.pollTimeoutMs ?? 120_000
  const deadline = Date.now() + timeout
  let current = job

  while (Date.now() < deadline) {
    if (current.status === "sent") {
      return { job: current, delivered: true }
    }
    if (current.status === "failed" || current.status === "cancelled") {
      throw new OutboundSmsError(
        current.error_message || `SMS ${current.status}`,
        undefined,
        current,
      )
    }
    await sleep(interval)
    current = await getOutboundSmsStatus(job.uid, {
      token: params.token,
      baseUrl: params.baseUrl,
    })
  }

  throw new OutboundSmsError(
    `Timeout — SMS toujours en statut "${current.status}" après ${timeout}ms`,
    undefined,
    current,
  )
}

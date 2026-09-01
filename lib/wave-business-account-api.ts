import { apiUrl } from "@/lib/env-config"
import type {
  WaveBusinessAccount,
  WaveBusinessAccountCreatePayload,
  WaveBusinessAccountUpdatePayload,
} from "@/lib/types/wave-business-account"

type ApiFetch = (
  input: RequestInfo,
  init?: RequestInit & { showSuccessToast?: boolean; successMessage?: string },
) => Promise<any>

const BASE = "api/payments/wave-business-accounts"

export async function fetchWaveBusinessAccounts(apiFetch: ApiFetch): Promise<WaveBusinessAccount[]> {
  const data = await apiFetch(apiUrl(`${BASE}/`))
  if (Array.isArray(data)) return data
  return data?.results ?? []
}

export async function createWaveBusinessAccount(
  apiFetch: ApiFetch,
  payload: WaveBusinessAccountCreatePayload,
): Promise<WaveBusinessAccount> {
  return apiFetch(apiUrl(`${BASE}/`), {
    method: "POST",
    body: JSON.stringify(payload),
    successMessage: "Compte Wave créé",
  })
}

export async function updateWaveBusinessAccount(
  apiFetch: ApiFetch,
  uid: string,
  payload: WaveBusinessAccountUpdatePayload,
): Promise<WaveBusinessAccount> {
  return apiFetch(apiUrl(`${BASE}/${uid}/`), {
    method: "PATCH",
    body: JSON.stringify(payload),
    successMessage: "Compte mis à jour",
  })
}

export async function deleteWaveBusinessAccount(apiFetch: ApiFetch, uid: string): Promise<void> {
  await apiFetch(apiUrl(`${BASE}/${uid}/`), {
    method: "DELETE",
    successMessage: "Compte supprimé",
  })
}

export async function waveAccountConnectStart(
  apiFetch: ApiFetch,
  uid: string,
): Promise<{ next_step: string; mobile_masked: string }> {
  return apiFetch(apiUrl(`${BASE}/${uid}/connect/start/`), {
    method: "POST",
    successMessage: "Connexion démarrée",
  })
}

export async function waveAccountConnectPin(
  apiFetch: ApiFetch,
  uid: string,
  pin: string,
): Promise<{ status: string; otp_required: boolean; mobile_masked: string }> {
  return apiFetch(apiUrl(`${BASE}/${uid}/connect/pin/`), {
    method: "POST",
    body: JSON.stringify({ pin }),
    successMessage: "Code SMS envoyé",
  })
}

export async function waveAccountConnectOtp(
  apiFetch: ApiFetch,
  uid: string,
  code: string,
): Promise<{ status: string; wallet_opaque_id: string; is_listening: boolean }> {
  return apiFetch(apiUrl(`${BASE}/${uid}/connect/otp/`), {
    method: "POST",
    body: JSON.stringify({ code }),
    successMessage: "Compte Wave connecté",
  })
}

export async function waveAccountDisconnect(apiFetch: ApiFetch, uid: string): Promise<void> {
  await apiFetch(apiUrl(`${BASE}/${uid}/disconnect/`), {
    method: "POST",
    successMessage: "Déconnecté",
  })
}

export async function waveAccountPollNow(
  apiFetch: ApiFetch,
  uid: string,
): Promise<{ stats: Record<string, number> }> {
  return apiFetch(apiUrl(`${BASE}/${uid}/poll/`), {
    method: "POST",
    successMessage: "Poll effectué",
  })
}

import { getApiBaseUrl } from "@/lib/env-config"
const baseUrl = () => getApiBaseUrl()

type ApiFetch = (input: RequestInfo, init?: RequestInit) => Promise<any>

export interface BulkResult {
  ok: number
  failed: number
}

async function runBulk(tasks: Promise<unknown>[]): Promise<BulkResult> {
  const results = await Promise.allSettled(tasks)
  const ok = results.filter((r) => r.status === "fulfilled").length
  return { ok, failed: results.length - ok }
}

const BULK_REASON = "Action groupée (admin)"

export async function bulkPaymentTransactionCancel(
  apiFetch: ApiFetch,
  uids: string[],
  reason = BULK_REASON,
): Promise<BulkResult> {
  return runBulk(
    uids.map((uid) =>
      apiFetch(`${baseUrl()}/api/payments/transactions/${uid}/cancel/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }),
    ),
  )
}

export async function bulkPaymentTransactionSuccess(
  apiFetch: ApiFetch,
  uids: string[],
  reason = BULK_REASON,
): Promise<BulkResult> {
  return runBulk(
    uids.map((uid) =>
      apiFetch(`${baseUrl()}/api/payments/transactions/${uid}/success/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }),
    ),
  )
}

export async function bulkPaymentTransactionFailed(
  apiFetch: ApiFetch,
  uids: string[],
  reason = BULK_REASON,
): Promise<BulkResult> {
  return runBulk(
    uids.map((uid) =>
      apiFetch(`${baseUrl()}/api/payments/transactions/${uid}/mark-failed/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      }),
    ),
  )
}

export async function bulkWaveBusinessCancel(
  apiFetch: ApiFetch,
  uids: string[],
): Promise<BulkResult> {
  return runBulk(
    uids.map((uid) =>
      apiFetch(`${baseUrl()}/api/payments/wave-business-transactions/${uid}/cancel/`, {
        method: "POST",
      }),
    ),
  )
}

export async function bulkMomoPayCancel(
  apiFetch: ApiFetch,
  uids: string[],
): Promise<BulkResult> {
  return runBulk(
    uids.map((uid) =>
      apiFetch(`${baseUrl()}/api/payments/momo-pay-transactions/${uid}/cancel/`, {
        method: "POST",
      }),
    ),
  )
}

export function formatBulkToast(action: string, result: BulkResult): { title: string; description: string } {
  return {
    title: action,
    description: `${result.ok} réussi(s)${result.failed ? `, ${result.failed} échec(s)` : ""}`,
  }
}

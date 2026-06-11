import type { PaginatedResponse, PaymentDevice } from "@/lib/types/flashpay-device"

const baseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || ""

type ApiFetch = (input: RequestInfo, init?: RequestInit & { showSuccessToast?: boolean; successMessage?: string }) => Promise<any>

export async function fetchStaffDevices(
  apiFetch: ApiFetch,
  params?: Record<string, string>,
): Promise<PaymentDevice[]> {
  const qs = new URLSearchParams({ page_size: "200", ...params })
  const data = await apiFetch(`${baseUrl()}/api/payments/devices/?${qs}`)
  if (Array.isArray(data)) return data
  return (data as PaginatedResponse<PaymentDevice>).results ?? []
}

export async function fetchDeviceByUid(apiFetch: ApiFetch, uid: string): Promise<PaymentDevice | null> {
  const devices = await fetchStaffDevices(apiFetch)
  return devices.find((d) => d.uid === uid) ?? null
}

export async function updateDeviceStatus(
  apiFetch: ApiFetch,
  uid: string,
  payload: Record<string, unknown>,
): Promise<PaymentDevice> {
  return apiFetch(`${baseUrl()}/api/payments/devices/${uid}/status/`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    successMessage: "Device enregistré",
  })
}

export async function createDeviceStaff(
  apiFetch: ApiFetch,
  payload: Record<string, unknown>,
): Promise<PaymentDevice> {
  return apiFetch(`${baseUrl()}/api/payments/devices/`, {
    method: "POST",
    body: JSON.stringify(payload),
    successMessage: "Device créé",
  })
}

export async function pushDeviceConfig(apiFetch: ApiFetch, deviceId: string): Promise<void> {
  await apiFetch(`${baseUrl()}/api/payments/remote-command/`, {
    method: "POST",
    body: JSON.stringify({
      command: "update_config",
      device_id: deviceId,
      parameters: {},
      priority: 1,
    }),
    successMessage: "Config poussée vers le mobile",
  })
}

export async function toggleDevicePause(
  apiFetch: ApiFetch,
  device: PaymentDevice,
  pause: boolean,
): Promise<void> {
  await updateDeviceStatus(apiFetch, device.uid, { is_paused: pause })
}

export async function fetchNetworks(apiFetch: ApiFetch, search?: string) {
  const qs = new URLSearchParams({ page_size: "100", is_active: "true" })
  if (search) qs.set("search", search)
  const data = await apiFetch(`${baseUrl()}/api/payments/networks/?${qs}`)
  return Array.isArray(data) ? data : data.results ?? []
}

export async function fetchAdminUsers(apiFetch: ApiFetch, search?: string) {
  const qs = new URLSearchParams({ page_size: "50" })
  if (search?.trim()) qs.set("search", search.trim())
  const data = await apiFetch(`${baseUrl()}/api/auth/admin/users/?${qs}`)
  return Array.isArray(data) ? data : data.results ?? []
}

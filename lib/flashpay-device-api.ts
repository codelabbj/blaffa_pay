import type { PaginatedResponse, PaymentDevice, FlashPayDeviceConfig } from "@/lib/types/flashpay-device"

const baseUrl = () => process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || ""

type ApiFetch = (input: RequestInfo, init?: RequestInit & { showSuccessToast?: boolean; successMessage?: string }) => Promise<any>

export async function fetchStaffDevices(
  apiFetch: ApiFetch,
  params?: Record<string, string>,
): Promise<PaymentDevice[]> {
  const all: PaymentDevice[] = []
  let page = 1
  let hasNext = true

  while (hasNext) {
    const qs = new URLSearchParams({
      page_size: "100",
      page: String(page),
      ...params,
    })
    const data = await apiFetch(`${baseUrl()}/api/payments/devices/?${qs}`)
    if (Array.isArray(data)) return data

    const batch = (data as PaginatedResponse<PaymentDevice>).results ?? []
    all.push(...batch)
    hasNext = Boolean((data as PaginatedResponse<PaymentDevice>).next)
    page += 1
    if (page > 100) break
  }

  return all
}

export async function fetchDeviceByUid(apiFetch: ApiFetch, uid: string): Promise<PaymentDevice | null> {
  try {
    const data = await apiFetch(`${baseUrl()}/api/payments/devices/?search=${encodeURIComponent(uid)}&page_size=20`)
    const list = Array.isArray(data) ? data : data.results ?? []
    return list.find((d: PaymentDevice) => d.uid === uid) ?? list[0] ?? null
  } catch {
    const devices = await fetchStaffDevices(apiFetch)
    return devices.find((d) => d.uid === uid) ?? null
  }
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

export async function pushDeviceConfig(
  apiFetch: ApiFetch,
  deviceId: string,
  flashpay?: FlashPayDeviceConfig,
): Promise<void> {
  const parameters: Record<string, unknown> = {}
  if (flashpay) parameters.flashpay = flashpay

  await apiFetch(`${baseUrl()}/api/payments/remote-command/`, {
    method: "POST",
    body: JSON.stringify({
      command: "update_config",
      device_id: deviceId,
      parameters,
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

export async function bulkToggleDevicePause(
  apiFetch: ApiFetch,
  devices: PaymentDevice[],
  pause: boolean,
): Promise<{ ok: number; failed: number }> {
  const results = await Promise.allSettled(
    devices.map((d) => updateDeviceStatus(apiFetch, d.uid, { is_paused: pause })),
  )
  const ok = results.filter((r) => r.status === "fulfilled").length
  return { ok, failed: results.length - ok }
}

export async function bulkPushDeviceConfig(
  apiFetch: ApiFetch,
  devices: PaymentDevice[],
): Promise<{ ok: number; failed: number }> {
  const results = await Promise.allSettled(
    devices.map((d) => {
      const flashpay = d.custom_settings?.flashpay
      const parameters: Record<string, unknown> = {}
      if (flashpay) parameters.flashpay = flashpay
      return apiFetch(`${baseUrl()}/api/payments/remote-command/`, {
        method: "POST",
        body: JSON.stringify({
          command: "update_config",
          device_id: d.device_id,
          parameters,
          priority: 1,
        }),
      })
    }),
  )
  const ok = results.filter((r) => r.status === "fulfilled").length
  return { ok, failed: results.length - ok }
}

export async function fetchCountries(apiFetch: ApiFetch) {
  const qs = new URLSearchParams({ page_size: "100", is_active: "true" })
  const data = await apiFetch(`${baseUrl()}/api/payments/countries/?${qs}`)
  return Array.isArray(data) ? data : data.results ?? []
}

export async function fetchNetworks(
  apiFetch: ApiFetch,
  opts?: string | { search?: string; country?: string },
) {
  const qs = new URLSearchParams({ page_size: "100", is_active: "true" })
  if (typeof opts === "string") {
    qs.set("search", opts)
  } else if (opts) {
    if (opts.search) qs.set("search", opts.search)
    if (opts.country) qs.set("country", opts.country)
  }
  const data = await apiFetch(`${baseUrl()}/api/payments/networks/?${qs}`)
  return Array.isArray(data) ? data : data.results ?? []
}

export async function fetchAdminUsers(apiFetch: ApiFetch, search?: string) {
  const qs = new URLSearchParams({ page_size: "50" })
  if (search?.trim()) qs.set("search", search.trim())
  const data = await apiFetch(`${baseUrl()}/api/auth/admin/users/?${qs}`)
  if (Array.isArray(data)) return data
  return data.users ?? data.results ?? []
}

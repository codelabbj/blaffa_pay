import type {
  DeviceFormValues,
  FlashPayDeviceConfig,
  PaymentDevice,
  DeviceKpiFilter,
} from "@/lib/types/flashpay-device"
import { DEVICE_CREATE_SAMPLE, SAMPLE_DEVICE_ID_VALUE } from "@/lib/flashpay-device-sample"

export function getFlashpayConfig(device: PaymentDevice | DeviceFormValues): FlashPayDeviceConfig | null {
  return device.custom_settings?.flashpay ?? null
}

export function isDeviceConfigured(device: PaymentDevice | DeviceFormValues): boolean {
  const steps = getFlashpayConfig(device)?.deposit?.ussd_steps ?? []
  return steps.filter((s) => s.trim()).length > 0
}

export function depositStepCount(device: PaymentDevice | DeviceFormValues): number {
  return (getFlashpayConfig(device)?.deposit?.ussd_steps ?? []).filter((s) => s.trim()).length
}

export function formatRelativeTime(iso?: string | null): string {
  if (!iso) return "—"
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return "—"
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "à l'instant"
  if (mins < 60) return `il y a ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `il y a ${hours} h`
  const days = Math.floor(hours / 24)
  return `il y a ${days} j`
}

export function networkChipClass(code?: string): string {
  const c = (code || "").toUpperCase()
  if (c.includes("MTN")) return "bg-yellow-100 text-yellow-900 border-yellow-200"
  if (c.includes("MOOV")) return "bg-blue-100 text-blue-900 border-blue-200"
  if (c.includes("ORANGE")) return "bg-orange-100 text-orange-900 border-orange-200"
  return "bg-slate-100 text-slate-800 border-slate-200"
}

export function networkInitials(label?: string, code?: string): string {
  const src = label || code || "?"
  return src.slice(0, 2).toUpperCase()
}

export function cloneDeviceAsNew(source: PaymentDevice): DeviceFormValues {
  const fp = source.custom_settings?.flashpay
  return {
    device_id: "",
    device_name: `${source.device_name || source.device_id} (copie)`,
    user: source.user ?? null,
    network: source.network ?? null,
    is_paused: source.is_paused ?? false,
    mode: source.mode ?? "both",
    is_online: false,
    last_seen: null,
    fcm_token: "",
    app_version: "",
    os_version: "",
    custom_settings: {
      ...structuredClone(source.custom_settings ?? {}),
      flashpay: fp ? structuredClone(fp) : undefined,
      flashpay_meta: {
        ...source.custom_settings?.flashpay_meta,
        cloned_from_device_id: source.device_id,
        cloned_at: new Date().toISOString(),
        is_sample: false,
      },
    },
  }
}

export function deviceToFormValues(device: PaymentDevice): DeviceFormValues {
  return {
    uid: device.uid,
    device_id: device.device_id,
    device_name: device.device_name || "",
    user: device.user ?? null,
    network: device.network ?? null,
    is_paused: device.is_paused,
    mode: device.mode || "both",
    is_online: device.is_online,
    last_seen: device.last_seen,
    fcm_token: device.fcm_token || "",
    app_version: device.app_version || "",
    os_version: device.os_version || "",
    custom_settings: structuredClone(device.custom_settings ?? {}),
  }
}

export function computeCompletion(form: DeviceFormValues): { percent: number; missing: string[] } {
  const missing: string[] = []
  if (!form.device_id.trim()) missing.push("device_id")
  if (!form.user) missing.push("user")
  if (!form.network) missing.push("network")
  const pin = form.custom_settings.flashpay?.momo_pin?.trim()
  if (!pin) missing.push("momo_pin")
  if (!isDeviceConfigured(form)) missing.push("ussd_deposit")
  const total = 5
  const done = total - missing.length
  return { percent: Math.round((done / total) * 100), missing }
}

export function validateCreateForm(form: DeviceFormValues): string[] {
  const errors: string[] = []
  if (!form.device_id.trim()) errors.push("Le device_id est requis")
  if (form.device_id === SAMPLE_DEVICE_ID_VALUE) errors.push("Personnalisez le device_id (valeur d'exemple)")
  if (!form.user) errors.push("Sélectionnez le propriétaire (agent)")
  if (!form.network) errors.push("Sélectionnez un réseau")
  if (!isDeviceConfigured(form)) errors.push("Ajoutez au moins une étape USSD dépôt")
  return errors
}

export function validateUpdateForm(form: DeviceFormValues): string[] {
  const errors: string[] = []
  if (!form.device_id.trim()) errors.push("Le device_id est requis")
  if (!isDeviceConfigured(form)) errors.push("Ajoutez au moins une étape USSD dépôt")
  return errors
}

export function isSampleForm(form: DeviceFormValues): boolean {
  return (
    form.device_id === SAMPLE_DEVICE_ID_VALUE ||
    form.custom_settings.flashpay_meta?.is_sample === true
  )
}

export function filterDevicesByKpi(devices: PaymentDevice[], filter: DeviceKpiFilter): PaymentDevice[] {
  switch (filter) {
    case "online":
      return devices.filter((d) => d.is_online)
    case "paused":
      return devices.filter((d) => d.is_paused)
    case "unconfigured":
      return devices.filter((d) => !isDeviceConfigured(d))
    default:
      return devices
  }
}

export function buildStatusPatchPayload(form: DeviceFormValues) {
  const now = new Date().toISOString()
  const flashpay = form.custom_settings.flashpay
  return {
    device_name: form.device_name,
    is_paused: form.is_paused,
    mode: form.mode,
    custom_settings: {
      ...form.custom_settings,
      flashpay: flashpay
        ? { ...flashpay, updated_by: "admin" as const }
        : undefined,
      flashpay_updated_at: now,
    },
  }
}

export function buildCreatePayload(form: DeviceFormValues) {
  const now = new Date().toISOString()
  const flashpay = form.custom_settings.flashpay
  return {
    device_id: form.device_id.trim(),
    device_name: form.device_name,
    user: form.user,
    network: form.network,
    is_paused: form.is_paused,
    mode: form.mode,
    is_online: false,
    fcm_token: form.fcm_token || "",
    app_version: form.app_version || "",
    os_version: form.os_version || "",
    custom_settings: {
      ...form.custom_settings,
      flashpay: flashpay ? { ...flashpay, updated_by: "admin" as const } : undefined,
      flashpay_updated_at: now,
      flashpay_meta: {
        ...form.custom_settings.flashpay_meta,
        is_sample: false,
      },
    },
  }
}

export function resetToSample(): DeviceFormValues {
  return structuredClone(DEVICE_CREATE_SAMPLE)
}

export function stepVisualClass(step: string): string {
  const u = step.toUpperCase()
  if (["NUM", "AMOUNT", "PIN", "OPKEY"].includes(u)) return "border-[#D4A24C] bg-amber-50 text-[#0B2545]"
  if (step.startsWith("*") || step.startsWith("#")) return "border-[#0B2545] bg-slate-50 text-[#0B2545]"
  return "border-slate-200 bg-white text-slate-700"
}

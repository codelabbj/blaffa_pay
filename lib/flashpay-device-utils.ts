import type {
  DeviceCustomSettings,
  DeviceFormValues,
  DeviceMode,
  FlashPayDeviceConfig,
  FlashPayMeta,
  PaymentDevice,
  DeviceKpiFilter,
} from "@/lib/types/flashpay-device"
import { DEVICE_CREATE_SAMPLE, SAMPLE_DEVICE_ID_VALUE } from "@/lib/flashpay-device-sample"
import { migrateYapsonToFlashpay } from "@/lib/yapson-config-migrate"
import { cn } from "@/lib/utils"

/** Config FlashPay minimale — permet Identité (SIM, réseau) sans ouvrir Config FlashPay avant. */
export function createEmptyFlashpayConfig(
  overrides?: Partial<FlashPayDeviceConfig>,
): FlashPayDeviceConfig {
  return {
    country_code: "CI",
    network_code: "",
    network_label: "",
    sim_slot: 0,
    momo_pin: "",
    deposit: {
      ussd_steps: [],
      session_type: "multi",
      check_balance_before: false,
      check_balance_after: false,
      op_key_enabled: true,
      auto_transfer_enabled: false,
      auto_transfer_to: "",
      auto_transfer_min_balance: 0,
    },
    withdraw: {
      ussd_steps: [],
      session_type: "multi",
      check_balance_before: false,
      check_balance_after: false,
    },
    balance: {
      ussd_steps: [],
      session_type: "single",
    },
    updated_by: "admin",
    ...overrides,
  }
}

/** Classes Tailwind partagées — pages FlashPay (light / dark). */
export const flashpayTheme = {
  page: "p-6 lg:p-8",
  stickyHeader:
    "sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-transparent py-2 -mx-6 px-6 lg:-mx-8 lg:px-8 mb-2",
  title: "text-2xl font-semibold text-[#0B2545] dark:text-gray-100",
  titleSm: "text-xl font-semibold text-[#0B2545] dark:text-gray-100",
  muted: "text-sm text-slate-500 dark:text-gray-400",
  mutedXs: "text-xs text-slate-500 dark:text-gray-400",
  accentBtn: "bg-[#D4A24C] text-[#0B2545] hover:bg-[#c9972e] dark:hover:bg-[#c9972e]",
  navyOutline:
    "border-[#0B2545] text-[#0B2545] dark:border-gray-500 dark:text-gray-200 dark:hover:bg-gray-800",
  card: "rounded-xl border border-slate-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800",
  cardHeader: "border-b border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800",
  tableRowHover:
    "cursor-pointer hover:bg-orange-50/50 dark:hover:!bg-gray-700/90 dark:hover:!text-gray-100",
  accordionItem:
    "border rounded-xl px-4 bg-white dark:bg-gray-800 shadow-sm border-slate-200 dark:border-gray-700",
  panelCard: "border-slate-200 dark:border-gray-700 shadow-sm rounded-xl bg-white dark:bg-gray-800",
  spinner: "text-[#0B2545] dark:text-gray-100",
  kpiCard: (active: boolean) =>
    cn(
      "rounded-xl border p-4 text-left transition shadow-sm bg-white dark:bg-gray-800",
      active
        ? "border-[#D4A24C] ring-2 ring-[#D4A24C]/30"
        : "border-slate-200 dark:border-gray-700 hover:border-slate-300 dark:hover:border-gray-600",
    ),
  selectedTile: "border-[#D4A24C] bg-amber-50 dark:bg-amber-900/20",
  unselectedTile:
    "border-slate-200 dark:border-gray-600 hover:border-slate-300 dark:hover:border-gray-500 hover:bg-orange-50/30 dark:hover:!bg-gray-700/80",
  networkTile:
    "rounded-xl border p-3 text-left text-sm transition text-gray-900 dark:text-gray-100",
  networkSelected:
    "border-[#0B2545] dark:border-[#D4A24C] bg-slate-50 dark:bg-gray-700/70 ring-2 ring-[#D4A24C]/80",
  tabActive: "bg-[#0B2545] text-white dark:bg-[#D4A24C] dark:text-[#0B2545]",
  simActive:
    "border-[#0B2545] bg-[#0B2545] text-white hover:bg-[#0B2545] hover:text-white dark:border-[#D4A24C] dark:bg-[#D4A24C] dark:text-[#0B2545] dark:hover:bg-[#D4A24C] ring-2 ring-[#D4A24C]/80 shadow-sm",
  simInactive:
    "border-2 border-slate-200 bg-white text-gray-700 hover:bg-orange-50/40 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700/80",
  sampleBanner:
    "rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 px-4 py-3",
  progressTrack: "flex-1 h-2 bg-slate-100 dark:bg-gray-700 rounded-full overflow-hidden",
}

export function getFlashpayConfig(device: PaymentDevice | DeviceFormValues): FlashPayDeviceConfig | null {
  return device.custom_settings?.flashpay ?? null
}

/** Ne conserve que les métadonnées admin utiles (exemple, clone). */
export function compactFlashpayMeta(meta?: FlashPayMeta): FlashPayMeta | undefined {
  if (!meta) return undefined
  const out: FlashPayMeta = {}
  if (meta.is_sample) out.is_sample = true
  if (meta.cloned_from_device_id) out.cloned_from_device_id = meta.cloned_from_device_id
  if (meta.cloned_at) out.cloned_at = meta.cloned_at
  return Object.keys(out).length > 0 ? out : undefined
}

export function compactCustomSettings(settings: DeviceCustomSettings): DeviceCustomSettings {
  const meta = compactFlashpayMeta(settings.flashpay_meta)
  const next: DeviceCustomSettings = { ...settings }
  if (meta) next.flashpay_meta = meta
  else delete next.flashpay_meta
  return next
}

export function formatDeviceMode(mode: DeviceMode = "both"): string {
  switch (mode) {
    case "deposit":
      return "Dépôt"
    case "withdrawal":
      return "Retrait"
    default:
      return "Les deux"
  }
}

/** Opérations USSD requises selon le mode device. */
export function getRequiredUssdOperations(mode: DeviceMode = "both"): ("deposit" | "withdraw")[] {
  switch (mode) {
    case "deposit":
      return ["deposit"]
    case "withdrawal":
      return ["withdraw"]
    default:
      return ["deposit", "withdraw"]
  }
}

export function hasUssdSteps(device: PaymentDevice | DeviceFormValues, operation: "deposit" | "withdraw"): boolean {
  const key = operation === "deposit" ? "deposit" : "withdraw"
  const steps = getFlashpayConfig(device)?.[key]?.ussd_steps ?? []
  return steps.filter((s) => s.trim()).length > 0
}

export function isDeviceConfigured(device: PaymentDevice | DeviceFormValues): boolean {
  const mode = device.mode ?? "both"
  return getRequiredUssdOperations(mode).every((op) => hasUssdSteps(device, op))
}

export function depositStepCount(device: PaymentDevice | DeviceFormValues): number {
  return (getFlashpayConfig(device)?.deposit?.ussd_steps ?? []).filter((s) => s.trim()).length
}

export function withdrawStepCount(device: PaymentDevice | DeviceFormValues): number {
  return (getFlashpayConfig(device)?.withdraw?.ussd_steps ?? []).filter((s) => s.trim()).length
}

export function ussdConfigSummary(device: PaymentDevice | DeviceFormValues): string {
  const mode = device.mode ?? "both"
  const parts = getRequiredUssdOperations(mode).map((op) => {
    const n = op === "deposit" ? depositStepCount(device) : withdrawStepCount(device)
    return op === "deposit" ? `${n} ét. dépôt` : `${n} ét. retrait`
  })
  return parts.join(" · ")
}

function ussdValidationError(device: PaymentDevice | DeviceFormValues): string | null {
  const missing = getRequiredUssdOperations(device.mode ?? "both").filter((op) => !hasUssdSteps(device, op))
  if (missing.length === 0) return null
  if (missing.length === 2) return "Ajoutez au moins une étape USSD dépôt et retrait"
  return missing[0] === "deposit"
    ? "Ajoutez au moins une étape USSD dépôt"
    : "Ajoutez au moins une étape USSD retrait"
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
  if (c.includes("MTN"))
    return "bg-yellow-100 text-yellow-900 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-200 dark:border-yellow-800"
  if (c.includes("MOOV"))
    return "bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-800"
  if (c.includes("ORANGE"))
    return "bg-orange-100 text-orange-900 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-800"
  return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"
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
    custom_settings: compactCustomSettings({
      ...structuredClone(source.custom_settings ?? {}),
      flashpay: fp ? structuredClone(fp) : undefined,
      flashpay_meta: {
        cloned_from_device_id: source.device_id,
        cloned_at: new Date().toISOString(),
      },
    }),
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
    custom_settings: compactCustomSettings(structuredClone(device.custom_settings ?? {})),
  }
}

export function computeCompletion(device: DeviceFormValues | PaymentDevice): {
  percent: number
  missing: string[]
  total: number
  done: number
  mode: DeviceMode
} {
  const mode = device.mode ?? "both"
  const checks: { ok: boolean; label: string }[] = [
    { ok: !!device.device_id?.trim(), label: "device_id" },
    { ok: !!device.user, label: "user" },
    { ok: !!device.network, label: "network" },
    { ok: !!getFlashpayConfig(device)?.momo_pin?.trim(), label: "momo_pin" },
  ]
  for (const op of getRequiredUssdOperations(mode)) {
    checks.push({
      ok: hasUssdSteps(device, op),
      label: op === "deposit" ? "ussd_deposit" : "ussd_withdraw",
    })
  }
  const missing = checks.filter((c) => !c.ok).map((c) => c.label)
  const done = checks.filter((c) => c.ok).length
  const total = checks.length
  return {
    percent: total ? Math.round((done / total) * 100) : 0,
    missing,
    total,
    done,
    mode,
  }
}

export function validateCreateForm(form: DeviceFormValues): string[] {
  const errors: string[] = []
  if (!form.device_id.trim()) errors.push("Le device_id est requis")
  if (form.device_id === SAMPLE_DEVICE_ID_VALUE) errors.push("Personnalisez le device_id (valeur d'exemple)")
  if (!form.user) errors.push("Sélectionnez le propriétaire (agent)")
  if (!form.network) errors.push("Sélectionnez un réseau")
  const ussdErr = ussdValidationError(form)
  if (ussdErr) errors.push(ussdErr)
  return errors
}

export function validateUpdateForm(form: DeviceFormValues): string[] {
  const errors: string[] = []
  if (!form.device_id.trim()) errors.push("Le device_id est requis")
  const ussdErr = ussdValidationError(form)
  if (ussdErr) errors.push(ussdErr)
  return errors
}

export function isSampleForm(form: DeviceFormValues): boolean {
  return (
    form.device_id === SAMPLE_DEVICE_ID_VALUE ||
    form.custom_settings.flashpay_meta?.is_sample === true
  )
}

/** En ligne si le backend le dit et que last_seen est récent (≤ 2 min). */
export function isDeviceEffectivelyOnline(device: PaymentDevice): boolean {
  if (!device.is_online) return false
  if (!device.last_seen) return true
  const seen = new Date(device.last_seen).getTime()
  if (Number.isNaN(seen)) return device.is_online
  return Date.now() - seen < 120_000
}

export function filterDevicesByKpi(devices: PaymentDevice[], filter: DeviceKpiFilter): PaymentDevice[] {
  switch (filter) {
    case "online":
      return devices.filter((d) => isDeviceEffectivelyOnline(d))
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
    custom_settings: compactCustomSettings({
      ...form.custom_settings,
      flashpay: flashpay ? { ...flashpay, updated_by: "admin" as const } : undefined,
      flashpay_updated_at: now,
    }),
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
    custom_settings: compactCustomSettings({
      ...form.custom_settings,
      flashpay: flashpay ? { ...flashpay, updated_by: "admin" as const } : undefined,
      flashpay_updated_at: now,
      flashpay_meta: compactFlashpayMeta({
        ...form.custom_settings.flashpay_meta,
        is_sample: false,
      }),
    }),
  }
}

export function resetToSample(): DeviceFormValues {
  return structuredClone(DEVICE_CREATE_SAMPLE)
}

export function stepTypeLabel(step: string): string | null {
  const u = step.trim().toUpperCase()
  if (["NUM", "AMOUNT", "PIN", "OPKEY"].includes(u)) return u
  if (step.startsWith("*") || step.startsWith("#")) return "USSD"
  return null
}

/** Ligne d'édition USSD — fond neutre, accent sur la bordure gauche. */
export function stepRowClass(step: string): string {
  const u = step.toUpperCase()
  if (["NUM", "AMOUNT", "PIN", "OPKEY"].includes(u))
    return "border-l-4 border-l-amber-500 border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800/90"
  if (step.startsWith("*") || step.startsWith("#"))
    return "border-l-4 border-l-sky-500 border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800/90"
  return "border-l-4 border-l-slate-400 border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800/90"
}

/** Chip d'aperçu timeline — fonds opaques pour rester lisibles sur la carte (gray-800). */
export function stepVisualClass(step: string): string {
  const trimmed = step.trim()
  const u = trimmed.toUpperCase()
  if (["NUM", "AMOUNT", "PIN", "OPKEY"].includes(u))
    return "border-amber-600 bg-amber-100 text-amber-950 shadow-sm dark:border-amber-300 dark:bg-amber-800 dark:text-amber-50"
  if (trimmed.startsWith("*") || trimmed.startsWith("#"))
    return "border-sky-600 bg-sky-100 text-sky-950 shadow-sm dark:border-sky-300 dark:bg-sky-800 dark:text-sky-50"
  if (/^\d+$/.test(trimmed))
    return "border-violet-600 bg-violet-100 text-violet-950 shadow-sm dark:border-violet-300 dark:bg-violet-800 dark:text-violet-50"
  return "border-slate-500 bg-slate-200 text-slate-900 shadow-sm dark:border-slate-400 dark:bg-slate-600 dark:text-slate-50"
}

function isYapsonLegacyConfig(obj: Record<string, unknown>): boolean {
  return "collection" in obj || "disburment" in obj || "disbursment" in obj
}

function isFlashpayConfigShape(obj: Record<string, unknown>): obj is FlashPayDeviceConfig {
  const deposit = obj.deposit as { ussd_steps?: unknown } | undefined
  return !!deposit && Array.isArray(deposit.ussd_steps)
}

export function buildFlashpayExportJson(form: DeviceFormValues): string {
  const fp = form.custom_settings.flashpay
  if (!fp) return JSON.stringify({ flashpay: null }, null, 2)
  const { momo_pin: _pin, ...shared } = fp
  return JSON.stringify({ flashpay: shared }, null, 2)
}

export function applyFlashpayConfigImport(
  raw: string,
  form: DeviceFormValues,
): { form: DeviceFormValues; error?: string } {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    const now = new Date().toISOString()

    if (isYapsonLegacyConfig(parsed)) {
      const pin = form.custom_settings.flashpay?.momo_pin || ""
      const flashpay = migrateYapsonToFlashpay(parsed, {
        momoPin: pin,
        simSlot: form.custom_settings.flashpay?.sim_slot ?? 0,
      })
      return {
        form: {
          ...form,
          custom_settings: compactCustomSettings({
            ...form.custom_settings,
            flashpay,
            flashpay_updated_at: now,
          }),
        },
      }
    }

    const flashpayPayload =
      parsed.flashpay && typeof parsed.flashpay === "object"
        ? (parsed.flashpay as FlashPayDeviceConfig)
        : isFlashpayConfigShape(parsed)
          ? (parsed as FlashPayDeviceConfig)
          : null

    if (!flashpayPayload) {
      return {
        form,
        error: "Format non reconnu. Attendu : { flashpay: {...} }, config FlashPay, ou JSON yapson.",
      }
    }

    const meta = compactFlashpayMeta(
      parsed.flashpay_meta as DeviceCustomSettings["flashpay_meta"] | undefined,
    )

    return {
      form: {
        ...form,
        custom_settings: compactCustomSettings({
          ...form.custom_settings,
          flashpay: {
            ...structuredClone(flashpayPayload),
            momo_pin: form.custom_settings.flashpay?.momo_pin ?? "",
          },
          flashpay_meta: meta ?? compactFlashpayMeta(form.custom_settings.flashpay_meta),
          flashpay_updated_at: now,
        }),
      },
    }
  } catch {
    return { form, error: "JSON invalide — vérifiez la syntaxe." }
  }
}

export function downloadFlashpayConfigJson(form: DeviceFormValues) {
  const blob = new Blob([buildFlashpayExportJson(form)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = `flashpay-config-${form.device_id?.trim() || "nouveau"}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

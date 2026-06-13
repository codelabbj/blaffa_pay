import type { DeviceMode, PaymentDevice } from "@/lib/types/flashpay-device"
import { isDeviceConfigured } from "@/lib/flashpay-device-utils"

export type DeviceStatusFilter = "all" | "online" | "offline"
export type DevicePauseFilter = "all" | "paused" | "active"
export type DeviceModeFilter = "all" | DeviceMode
export type DeviceConfigFilter = "all" | "configured" | "unconfigured"

export type DeviceSortField =
  | "last_seen"
  | "created_at"
  | "device_name"
  | "device_id"
  | "is_online"
  | "is_paused"
  | "mode"

export interface DeviceListFilters {
  search: string
  status: DeviceStatusFilter
  pause: DevicePauseFilter
  mode: DeviceModeFilter
  network: string
  config: DeviceConfigFilter
}

export interface DeviceSortState {
  field: DeviceSortField
  dir: "asc" | "desc"
}

export const DEFAULT_DEVICE_LIST_FILTERS: DeviceListFilters = {
  search: "",
  status: "all",
  pause: "all",
  mode: "all",
  network: "all",
  config: "all",
}

export const DEFAULT_DEVICE_SORT: DeviceSortState = {
  field: "last_seen",
  dir: "desc",
}

export const DEVICE_SORT_COLUMNS: { field: DeviceSortField; label: string }[] = [
  { field: "last_seen", label: "Activité" },
  { field: "device_name", label: "Device" },
  { field: "is_online", label: "Statut" },
  { field: "is_paused", label: "Pause" },
  { field: "mode", label: "Mode" },
  { field: "created_at", label: "Créé le" },
]

export function buildDeviceListApiParams(
  filters: DeviceListFilters,
  sort: DeviceSortState,
): Record<string, string> {
  const params: Record<string, string> = {
    ordering: sort.dir === "desc" ? `-${sort.field}` : sort.field,
  }
  const q = filters.search.trim()
  if (q) params.search = q
  if (filters.status === "online") params.is_online = "true"
  if (filters.status === "offline") params.is_online = "false"
  if (filters.pause === "paused") params.is_paused = "true"
  if (filters.pause === "active") params.is_paused = "false"
  if (filters.mode !== "all") params.mode = filters.mode
  if (filters.network !== "all") params.network = filters.network
  return params
}

/** Filtre config (non supporté côté API). */
export function applyClientConfigFilter(
  devices: PaymentDevice[],
  config: DeviceConfigFilter,
): PaymentDevice[] {
  if (config === "configured") return devices.filter((d) => isDeviceConfigured(d))
  if (config === "unconfigured") return devices.filter((d) => !isDeviceConfigured(d))
  return devices
}

export function toggleSort(
  current: DeviceSortState,
  field: DeviceSortField,
): DeviceSortState {
  if (current.field === field) {
    return { field, dir: current.dir === "asc" ? "desc" : "asc" }
  }
  return { field, dir: field === "device_name" || field === "device_id" ? "asc" : "desc" }
}

export function filtersFromKpi(
  kpi: "all" | "online" | "paused" | "unconfigured",
  prev: DeviceListFilters,
): DeviceListFilters {
  const base = { ...prev, status: "all" as const, pause: "all" as const, config: "all" as const }
  switch (kpi) {
    case "online":
      return { ...base, status: "online" }
    case "paused":
      return { ...base, pause: "paused" }
    case "unconfigured":
      return { ...base, config: "unconfigured" }
    default:
      return { ...DEFAULT_DEVICE_LIST_FILTERS, search: prev.search }
  }
}

export function activeKpiFromFilters(filters: DeviceListFilters): "all" | "online" | "paused" | "unconfigured" {
  if (filters.config === "unconfigured" && filters.status === "all" && filters.pause === "all") {
    return "unconfigured"
  }
  if (filters.status === "online" && filters.pause === "all" && filters.config === "all") return "online"
  if (filters.pause === "paused" && filters.status === "all" && filters.config === "all") return "paused"
  if (
    filters.status === "all" &&
    filters.pause === "all" &&
    filters.config === "all" &&
    filters.mode === "all" &&
    filters.network === "all"
  ) {
    return "all"
  }
  return "all"
}

export function hasActiveFilters(filters: DeviceListFilters): boolean {
  return (
    filters.status !== "all" ||
    filters.pause !== "all" ||
    filters.mode !== "all" ||
    filters.network !== "all" ||
    filters.config !== "all"
  )
}

export type DeviceMode = "deposit" | "withdrawal" | "both"
export type SessionType = "single" | "multi"
export type OperationTab = "deposit" | "withdraw" | "balance"

/** Comment le téléphone exécute les transactions (aligné app Android FlashPay). */
export type ExecutionMode = "ussd" | "wave_business" | "wave_personal" | "orange"

export interface FlashPayDepositConfig {
  ussd_steps: string[]
  session_type: SessionType
  check_balance_before: boolean
  check_balance_after: boolean
  op_key_enabled: boolean
  auto_transfer_enabled: boolean
  auto_transfer_to: string
  auto_transfer_min_balance: number
}

export interface FlashPayWithdrawConfig {
  ussd_steps: string[]
  session_type: SessionType
  check_balance_before: boolean
  check_balance_after: boolean
}

export interface FlashPayBalanceConfig {
  ussd_steps: string[]
  session_type: SessionType
}

export interface FlashPayDeviceConfig {
  country_code: string
  network_code: string
  network_label: string
  sim_slot: 0 | 1
  /** ussd = séquences USSD ; wave_* / orange = application mobile (accessibilité). */
  execution_mode: ExecutionMode
  momo_pin: string
  deposit: FlashPayDepositConfig
  withdraw: FlashPayWithdrawConfig
  balance: FlashPayBalanceConfig
  updated_by?: "admin" | "mobile" | "import_yapson"
}

export interface FlashPayMeta {
  is_sample?: boolean
  cloned_from_device_id?: string
  cloned_at?: string
}

export interface DeviceCustomSettings {
  flashpay?: FlashPayDeviceConfig
  flashpay_updated_at?: string
  flashpay_meta?: FlashPayMeta
  [key: string]: unknown
}

export interface PaymentDevice {
  uid: string
  device_id: string
  device_name?: string
  user?: string
  user_name?: string
  user_email?: string
  network?: string | null
  network_name?: string
  is_paused: boolean
  mode: DeviceMode
  is_online: boolean
  last_seen?: string | null
  fcm_token?: string
  app_version?: string
  os_version?: string
  custom_settings?: DeviceCustomSettings
  created_at?: string
  updated_at?: string
}

export interface DeviceFormValues {
  uid?: string
  device_id: string
  device_name: string
  user: string | null
  network: string | null
  is_paused: boolean
  mode: DeviceMode
  is_online: boolean
  last_seen?: string | null
  fcm_token: string
  app_version: string
  os_version: string
  custom_settings: DeviceCustomSettings
}

export interface PaginatedResponse<T> {
  count: number
  next?: string | null
  previous?: string | null
  results: T[]
}

export type DeviceKpiFilter = "all" | "online" | "paused" | "unconfigured"

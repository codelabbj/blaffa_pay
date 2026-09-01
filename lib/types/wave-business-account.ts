export type WaveBusinessAccountStatus = "offline" | "pending_otp" | "online" | "expired"

export type WaveValidationMode = "notification" | "api_listen" | "both"

export interface WaveBusinessAccount {
  uid: string
  label: string
  mobile: string
  mobile_masked: string
  status: WaveBusinessAccountStatus
  validation_mode: WaveValidationMode
  owner_uid: string
  owner_username: string
  owner_email: string
  is_listening: boolean
  wallet_opaque_id: string
  last_poll_at: string | null
  last_error: string
  has_pin: boolean
  has_session: boolean
  created_at: string
  updated_at: string
}

export interface WaveBusinessAccountCreatePayload {
  label?: string
  mobile: string
  validation_mode?: WaveValidationMode
  pin?: string
  owner_uid?: string
}

export interface WaveBusinessAccountUpdatePayload {
  label?: string
  validation_mode?: WaveValidationMode
  is_listening?: boolean
  pin?: string
}

export const VALIDATION_MODE_OPTIONS: {
  value: WaveValidationMode
  label: string
  description: string
}[] = [
  {
    value: "notification",
    label: "Notifications",
    description: "Validation via notifs FlashPay (comportement actuel)",
  },
  {
    value: "api_listen",
    label: "API Wave Business",
    description: "Connexion Wave + poll historique (sans device requis)",
  },
  {
    value: "both",
    label: "Les deux",
    description: "Notification ou API — le premier qui matche gagne",
  },
]

import type { DeviceFormValues, FlashPayDeviceConfig } from "@/lib/types/flashpay-device"
import { migrateYapsonToFlashpay, YAPSON_LEGACY_MOOV_BJ } from "@/lib/yapson-config-migrate"

const SAMPLE_DEVICE_ID = "sample-device-a1b2c3d4"

/** Template principal — migration réelle yapson Moov Bénin (§5.3) */
const migrated = migrateYapsonToFlashpay(YAPSON_LEGACY_MOOV_BJ, { momoPin: "0000" })

export const MOOV_BJ_FLASHPAY: FlashPayDeviceConfig = migrated

export const MTN_CI_FLASHPAY: FlashPayDeviceConfig = {
  country_code: "CI",
  network_code: "MTN",
  network_label: "MTN CI",
  sim_slot: 0,
  momo_pin: "1234",
  deposit: {
    ussd_steps: ["*133#", "1", "PIN", "AMOUNT", "NUM"],
    session_type: "multi",
    check_balance_before: false,
    check_balance_after: true,
    op_key_enabled: true,
    auto_transfer_enabled: false,
    auto_transfer_to: "",
    auto_transfer_min_balance: 0,
  },
  withdraw: {
    ussd_steps: ["*133#", "2", "PIN", "AMOUNT"],
    session_type: "multi",
    check_balance_before: false,
    check_balance_after: true,
  },
  balance: {
    ussd_steps: ["*133#", "6", "PIN"],
    session_type: "single",
  },
  updated_by: "admin",
}

export const ORANGE_CI_FLASHPAY: FlashPayDeviceConfig = {
  country_code: "CI",
  network_code: "ORANGE",
  network_label: "Orange CI",
  sim_slot: 0,
  momo_pin: "1234",
  deposit: {
    ussd_steps: ["#144#", "1", "PIN", "AMOUNT", "NUM"],
    session_type: "multi",
    check_balance_before: false,
    check_balance_after: true,
    op_key_enabled: false,
    auto_transfer_enabled: false,
    auto_transfer_to: "",
    auto_transfer_min_balance: 0,
  },
  withdraw: {
    ussd_steps: ["#144#", "2", "PIN", "AMOUNT"],
    session_type: "multi",
    check_balance_before: false,
    check_balance_after: false,
  },
  balance: {
    ussd_steps: ["#144#", "3", "PIN"],
    session_type: "single",
  },
  updated_by: "admin",
}

export const DEVICE_PRESETS = [
  {
    id: "moov-bj-yapson",
    label: "Moov Bénin (yapson)",
    description: "Migration ManualConfigPage → FlashPay",
    config: MOOV_BJ_FLASHPAY,
    legacy: YAPSON_LEGACY_MOOV_BJ,
  },
  { id: "mtn-ci", label: "MTN CI", description: "Template MTN Côte d'Ivoire", config: MTN_CI_FLASHPAY },
  { id: "orange-ci", label: "Orange CI", description: "Template Orange CI", config: ORANGE_CI_FLASHPAY },
] as const

export const DEVICE_CREATE_SAMPLE: DeviceFormValues = {
  device_id: SAMPLE_DEVICE_ID,
  device_name: "Moov Bénin SIM1",
  user: null,
  network: null,
  is_paused: false,
  mode: "both",
  is_online: false,
  fcm_token: "",
  app_version: "",
  os_version: "",
  custom_settings: {
    flashpay: structuredClone(MOOV_BJ_FLASHPAY),
    flashpay_meta: {
      is_sample: true,
    },
  },
}

export const SAMPLE_DEVICE_ID_VALUE = SAMPLE_DEVICE_ID

/** JSON yapson brut pour copier-coller / import admin */
export const YAPSON_LEGACY_MOOV_BJ_JSON = JSON.stringify(YAPSON_LEGACY_MOOV_BJ, null, 2)

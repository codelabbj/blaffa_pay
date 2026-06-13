import type { DeviceCustomSettings, FlashPayDeviceConfig } from "@/lib/types/flashpay-device"

/** Ancienne config yapson ManualConfigPage — Moov Bénin (SUPERADMIN_DEVICES.md §5.3) */
export const YAPSON_LEGACY_MOOV_BJ = {
  dialCode: "229",
  smsSender: "moov money",
  erroKeyWords:
    "Indisponble, reessayer plus tard, indisponible, invalide MMI, 111 pour assistance, Veuillez contacter",
  verifyBallance: true,
  collection: "*855#\n1\n01\n1\nNUMBER\nNUMBER\nAMOUNT\n00\nCODE",
  country: "BJ",
  disburment: "*855#\n2\n02\nNUMBER\nNUMBER\nAMOUNT\nCODE",
  network: "moov benin",
  solde: "*855#\n7\n1\nCODE",
  collectionInSingleSession: false,
  ballanceInSingleSession: true,
  disbursmentInSingleSession: false,
  checkBallanceBeforeCollection: true,
  checkBallanceAfterCollection: true,
  checkBallanceBeforeDisbursment: true,
  checkBallanceAfterDisbursmnent: false,
  collectionSmsKeyWord: "Vous avez envoye",
  disbursmentSmsKeyWord: "TAX AIB",
  merchantCollection: "*855#\n1\n01\n1\nNUMBER\nNUMBER\nAMOUNT\n00\nCODE",
  merchantDisburment: "*855#\n2\n02\nNUMBER\nNUMBER\nAMOUNT\nCODE",
  _exported_from: "ManualConfigPage_v1.0",
} as const

export type YapsonLegacyConfig = typeof YAPSON_LEGACY_MOOV_BJ & Record<string, unknown>

function parseSteps(raw?: string): string[] {
  if (!raw?.trim()) return []
  return raw
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((step) => {
      if (step === "NUMBER") return "NUM"
      if (step === "CODE") return "PIN"
      return step
    })
}

function networkCodeFromLabel(network?: string): string {
  const n = (network || "").toLowerCase()
  if (n.includes("moov")) return "MOOV"
  if (n.includes("mtn")) return "MTN"
  if (n.includes("orange")) return "ORANGE"
  return "MOOV"
}

export function migrateYapsonToFlashpay(
  legacy: Record<string, unknown>,
  options?: { momoPin?: string; simSlot?: 0 | 1 },
): FlashPayDeviceConfig {
  const collection = String(legacy.collection || legacy.merchantCollection || "")
  const disburment = String(legacy.disburment || legacy.merchantDisburment || "")
  const solde = String(legacy.solde || "")
  const networkLabel = String(legacy.network || "Réseau")
  const country = String(legacy.country || "BJ").toUpperCase()

  const flashpay: FlashPayDeviceConfig = {
    country_code: country,
    network_code: networkCodeFromLabel(networkLabel),
    network_label: networkLabel.toLowerCase().includes("moov")
      ? "Moov Bénin"
      : networkLabel.replace(/\b\w/g, (c) => c.toUpperCase()),
    sim_slot: options?.simSlot ?? 0,
    momo_pin: options?.momoPin ?? "",
    deposit: {
      ussd_steps: parseSteps(collection),
      session_type: legacy.collectionInSingleSession ? "single" : "multi",
      check_balance_before: Boolean(legacy.checkBallanceBeforeCollection),
      check_balance_after: Boolean(legacy.checkBallanceAfterCollection),
      op_key_enabled: true,
      auto_transfer_enabled: false,
      auto_transfer_to: "",
      auto_transfer_min_balance: 0,
    },
    withdraw: {
      ussd_steps: parseSteps(disburment),
      session_type: legacy.disbursmentInSingleSession ? "single" : "multi",
      check_balance_before: Boolean(legacy.checkBallanceBeforeDisbursment),
      check_balance_after: Boolean(legacy.checkBallanceAfterDisbursmnent),
    },
    balance: {
      ussd_steps: parseSteps(solde),
      session_type: legacy.ballanceInSingleSession ? "single" : "multi",
    },
    updated_by: "import_yapson",
  }

  return flashpay
}

/** Config FlashPay issue de la migration yapson Moov BJ (référence §5.3) */
export function moovBeninFromYapson(momoPin = ""): FlashPayDeviceConfig {
  return migrateYapsonToFlashpay(YAPSON_LEGACY_MOOV_BJ, { momoPin })
}

export function moovBeninCustomSettings(momoPin = ""): DeviceCustomSettings {
  return {
    flashpay: migrateYapsonToFlashpay(YAPSON_LEGACY_MOOV_BJ, { momoPin }),
    flashpay_updated_at: new Date().toISOString(),
  }
}

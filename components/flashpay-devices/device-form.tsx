"use client"

import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sparkles, Wifi, WifiOff, Pause, Play } from "lucide-react"
import type { DeviceFormValues, OperationTab } from "@/lib/types/flashpay-device"
import { DEVICE_PRESETS, YAPSON_LEGACY_MOOV_BJ_JSON } from "@/lib/flashpay-device-sample"
import { migrateYapsonToFlashpay } from "@/lib/yapson-config-migrate"
import {
  computeCompletion,
  flashpayTheme,
  formatRelativeTime,
  isSampleForm,
  networkChipClass,
} from "@/lib/flashpay-device-utils"
import { UssdFlowBuilder } from "@/components/flashpay-devices/ussd-flow-builder"
import { DevicePreviewPanel } from "@/components/flashpay-devices/device-preview-panel"
import { useApi } from "@/lib/useApi"
import { fetchAdminUsers, fetchNetworks } from "@/lib/flashpay-device-api"
import { cn } from "@/lib/utils"

interface DeviceFormProps {
  form: DeviceFormValues
  onChange: (form: DeviceFormValues) => void
  mode: "create" | "edit"
  clonedFrom?: string
  onPushConfig?: () => void
  pushing?: boolean
}

export function DeviceForm({
  form,
  onChange,
  mode,
  clonedFrom,
  onPushConfig,
  pushing,
}: DeviceFormProps) {
  const apiFetch = useApi()
  const [activeTab, setActiveTab] = useState<OperationTab>("deposit")
  const [users, setUsers] = useState<any[]>([])
  const [networks, setNetworks] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [presetId, setPresetId] = useState<string | null>(null)
  const [showPresetConfirm, setShowPresetConfirm] = useState(false)

  const fp = form.custom_settings.flashpay
  const completion = computeCompletion(form)
  const sample = isSampleForm(form)

  useEffect(() => {
    fetchNetworks(apiFetch).then(setNetworks).catch(() => setNetworks([]))
  }, [apiFetch])

  useEffect(() => {
    const t = setTimeout(() => {
      fetchAdminUsers(apiFetch, userSearch).then(setUsers).catch(() => setUsers([]))
    }, 300)
    return () => clearTimeout(t)
  }, [apiFetch, userSearch])

  const selectedNetwork = useMemo(
    () => networks.find((n) => n.uid === form.network),
    [networks, form.network],
  )

  const patch = (partial: Partial<DeviceFormValues>) => onChange({ ...form, ...partial })

  const patchFlashpay = (partial: Partial<NonNullable<typeof fp>>) => {
    if (!fp) return
    onChange({
      ...form,
      custom_settings: {
        ...form.custom_settings,
        flashpay: { ...fp, ...partial },
      },
    })
  }

  const patchOperation = (tab: OperationTab, steps: string[]) => {
    if (!fp) return
    onChange({
      ...form,
      custom_settings: {
        ...form.custom_settings,
        flashpay: {
          ...fp,
          [tab]: { ...fp[tab], ussd_steps: steps },
        },
      },
    })
  }

  const applyPreset = (presetId: string) => {
    const preset = DEVICE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    onChange({
      ...form,
      custom_settings: {
        ...form.custom_settings,
        flashpay: structuredClone(preset.config),
        flashpay_meta: {
          ...("meta" in preset && preset.meta ? structuredClone(preset.meta) : {}),
          ...form.custom_settings.flashpay_meta,
          is_sample: false,
        },
        flashpay_updated_at: new Date().toISOString(),
      },
    })
    setPresetId(null)
    setShowPresetConfirm(false)
  }

  const [yapsonImport, setYapsonImport] = useState(YAPSON_LEGACY_MOOV_BJ_JSON)

  const importYapsonJson = () => {
    try {
      const legacy = JSON.parse(yapsonImport) as Record<string, unknown>
      const pin = form.custom_settings.flashpay?.momo_pin || ""
      const { flashpay, meta } = migrateYapsonToFlashpay(legacy, {
        momoPin: pin,
        simSlot: form.custom_settings.flashpay?.sim_slot ?? 0,
      })
      onChange({
        ...form,
        custom_settings: {
          ...form.custom_settings,
          flashpay,
          flashpay_meta: { ...meta, is_sample: false },
          flashpay_updated_at: new Date().toISOString(),
        },
      })
    } catch {
      /* invalid JSON — ignore */
    }
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-4">
        {sample && mode === "create" && (
          <div className={`${flashpayTheme.sampleBanner} flex items-start gap-3`}>
            <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-900 dark:text-amber-100">
              Modèle d&apos;exemple chargé — personnalisez <strong>device_id</strong>, l&apos;agent et le PIN avant enregistrement.
            </p>
          </div>
        )}
        {clonedFrom && (
          <Badge variant="outline" className="border-blue-300 text-blue-800 dark:border-blue-700 dark:text-blue-300">
            Cloné depuis {clonedFrom}
          </Badge>
        )}

        <Accordion type="multiple" defaultValue={["identity", "state", "flashpay"]} className="space-y-2">
          <AccordionItem value="identity" className={flashpayTheme.accordionItem}>
            <AccordionTrigger className="text-[#0B2545] dark:text-gray-100 font-semibold">Identité & rattachement</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div>
                <Label>device_id</Label>
                <Input
                  className={cn(
                    "font-mono mt-1",
                    sample && form.device_id.includes("sample") && "border-amber-400 ring-amber-200",
                  )}
                  value={form.device_id}
                  readOnly={mode === "edit"}
                  onChange={(e) => patch({ device_id: e.target.value })}
                  placeholder="Identifiant saisi dans FlashPay"
                />
              </div>
              <div>
                <Label>Nom affiché</Label>
                <Input
                  className="mt-1"
                  value={form.device_name}
                  onChange={(e) => patch({ device_name: e.target.value })}
                  placeholder="Ex. Téléphone Moov SIM1"
                />
              </div>
              <div>
                <Label>Propriétaire (agent)</Label>
                <Input
                  className="mt-1 mb-2"
                  placeholder="Rechercher par email ou nom…"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                <div className="grid gap-2 max-h-40 overflow-y-auto">
                  {users.map((u) => (
                    <button
                      key={u.uid}
                      type="button"
                      onClick={() => patch({ user: u.uid })}
                      className={cn(
                        "text-left rounded-lg border p-2 text-sm transition",
                        form.user === u.uid ? flashpayTheme.selectedTile : flashpayTheme.unselectedTile,
                      )}
                    >
                      <span className="font-medium">{u.display_name || u.email}</span>
                      <span className={`block ${flashpayTheme.mutedXs}`}>{u.email}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Réseau MoMo</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {networks.map((n) => (
                    <button
                      key={n.uid}
                      type="button"
                      onClick={() => {
                        patch({ network: n.uid })
                        patchFlashpay({
                          network_code: n.code,
                          network_label: n.nom,
                          country_code: n.country_name?.slice(0, 2)?.toUpperCase() || fp?.country_code || "CI",
                        })
                      }}
                      className={cn(
                        "rounded-xl border p-3 text-left text-sm transition",
                        form.network === n.uid ? flashpayTheme.networkSelected : flashpayTheme.unselectedTile,
                      )}
                    >
                      <span className={cn("inline-block px-2 py-0.5 rounded text-xs border mb-1", networkChipClass(n.code))}>
                        {n.code}
                      </span>
                      <p className="font-medium">{n.nom}</p>
                      <p className={flashpayTheme.mutedXs}>{n.country_name}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Slot SIM</Label>
                <div className="flex gap-2 mt-2">
                  {([0, 1] as const).map((slot) => (
                    <Button
                      key={slot}
                      type="button"
                      variant={fp?.sim_slot === slot ? "default" : "outline"}
                      className={fp?.sim_slot === slot ? "bg-[#0B2545]" : ""}
                      onClick={() => patchFlashpay({ sim_slot: slot })}
                    >
                      SIM {slot + 1}
                    </Button>
                  ))}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="state" className={flashpayTheme.accordionItem}>
            <AccordionTrigger className="text-[#0B2545] dark:text-gray-100 font-semibold">État & connectivité</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-gray-600 p-4">
                <div className="flex items-center gap-3">
                  {form.is_paused ? <Pause className="text-orange-500" /> : <Play className="text-green-600" />}
                  <div>
                    <p className="font-medium">Pause device</p>
                    <p className={flashpayTheme.mutedXs}>L&apos;app n&apos;exécutera pas de transactions</p>
                  </div>
                </div>
                <Switch checked={form.is_paused} onCheckedChange={(v) => patch({ is_paused: v })} />
              </div>
              <div>
                <Label>Mode</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(["deposit", "withdrawal", "both"] as const).map((m) => (
                    <Button
                      key={m}
                      type="button"
                      size="sm"
                      variant={form.mode === m ? "default" : "outline"}
                      className={form.mode === m ? flashpayTheme.accentBtn : ""}
                      onClick={() => patch({ mode: m })}
                    >
                      {m === "deposit" ? "Dépôt" : m === "withdrawal" ? "Retrait" : "Les deux"}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-gray-600 p-4 flex items-center gap-3">
                {form.is_online ? (
                  <Wifi className="h-8 w-8 text-green-600" />
                ) : (
                  <WifiOff className="h-8 w-8 text-slate-400" />
                )}
                <div>
                  <p className="font-medium">{form.is_online ? "En ligne" : "Hors ligne"}</p>
                  <p className={flashpayTheme.mutedXs}>Dernière activité : {formatRelativeTime(form.last_seen)}</p>
                </div>
              </div>
              <details>
                <summary className="cursor-pointer text-sm text-slate-600 dark:text-gray-400">FCM token</summary>
                <Textarea className="mt-2 font-mono text-xs" rows={2} value={form.fcm_token} readOnly />
              </details>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="flashpay" className={flashpayTheme.accordionItem}>
            <AccordionTrigger className="text-[#0B2545] dark:text-gray-100 font-semibold">Config FlashPay</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <div className="flex flex-wrap gap-2">
                {DEVICE_PRESETS.map((p) => (
                  <Button
                    key={p.id}
                    type="button"
                    size="sm"
                    variant={p.id === "moov-bj-yapson" ? "default" : "outline"}
                    className={p.id === "moov-bj-yapson" ? flashpayTheme.accentBtn : ""}
                    onClick={() => {
                      setPresetId(p.id)
                      setShowPresetConfirm(true)
                    }}
                  >
                    {p.label}
                  </Button>
                ))}
              </div>
              <p className={flashpayTheme.mutedXs}>
                Le template <strong>Moov Bénin (yapson)</strong> reprend l&apos;exemple ManualConfigPage migré (Moov BJ §5.3).
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Pays</Label>
                  <Input
                    className="mt-1"
                    value={fp?.country_code || ""}
                    onChange={(e) => patchFlashpay({ country_code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div>
                  <Label>PIN MoMo</Label>
                  <Input
                    className="mt-1 font-mono"
                    type="password"
                    value={fp?.momo_pin || ""}
                    onChange={(e) => patchFlashpay({ momo_pin: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                {(["deposit", "withdraw", "balance"] as OperationTab[]).map((tab) => (
                  <Button
                    key={tab}
                    type="button"
                    size="sm"
                    variant={activeTab === tab ? "default" : "outline"}
                    className={activeTab === tab ? "bg-[#0B2545]" : ""}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "deposit" ? "Dépôt" : tab === "withdraw" ? "Retrait" : "Solde"}
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {fp?.[tab]?.ussd_steps?.length ?? 0}
                    </Badge>
                  </Button>
                ))}
              </div>
              {!fp ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    onChange({
                      ...form,
                      custom_settings: {
                        ...form.custom_settings,
                        flashpay: structuredClone(DEVICE_PRESETS[0].config),
                      },
                    })
                  }
                >
                  Initialiser config FlashPay (Moov BJ)
                </Button>
              ) : (
                <>
                  <UssdFlowBuilder
                    steps={fp[activeTab]?.ussd_steps ?? []}
                    onChange={(steps) => patchOperation(activeTab, steps)}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-gray-600 p-3">
                      <span className="text-sm text-gray-900 dark:text-gray-200">Session multi</span>
                      <Switch
                        checked={fp[activeTab]?.session_type === "multi"}
                        onCheckedChange={(v) =>
                          patchFlashpay({
                            [activeTab]: {
                              ...fp[activeTab],
                              session_type: v ? "multi" : "single",
                            },
                          } as any)
                        }
                      />
                    </div>
                    {activeTab === "deposit" && (
                      <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-gray-600 p-3">
                        <span className="text-sm text-gray-900 dark:text-gray-200">Auto-transfer</span>
                        <Switch
                          checked={fp.deposit.auto_transfer_enabled}
                          onCheckedChange={(v) =>
                            patchFlashpay({
                              deposit: { ...fp.deposit, auto_transfer_enabled: v },
                            })
                          }
                        />
                      </div>
                    )}
                  </div>
                  {activeTab === "deposit" && fp.deposit.auto_transfer_enabled && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Destination</Label>
                        <Input
                          className="mt-1"
                          value={fp.deposit.auto_transfer_to}
                          onChange={(e) =>
                            patchFlashpay({ deposit: { ...fp.deposit, auto_transfer_to: e.target.value } })
                          }
                        />
                      </div>
                      <div>
                        <Label>Seuil min (FCFA)</Label>
                        <Input
                          type="number"
                          className="mt-1"
                          value={fp.deposit.auto_transfer_min_balance}
                          onChange={(e) =>
                            patchFlashpay({
                              deposit: { ...fp.deposit, auto_transfer_min_balance: Number(e.target.value) || 0 },
                            })
                          }
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="advanced" className={flashpayTheme.accordionItem}>
            <AccordionTrigger className="text-[#0B2545] dark:text-gray-100 font-semibold">Avancé</AccordionTrigger>
            <AccordionContent className="pb-4 space-y-4">
              <div>
                <Label>Import config yapson (ManualConfigPage)</Label>
                <Textarea
                  className="mt-2 font-mono text-xs"
                  rows={8}
                  value={yapsonImport}
                  onChange={(e) => setYapsonImport(e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={importYapsonJson}>
                  Convertir yapson → FlashPay
                </Button>
              </div>
              <Label>JSON custom_settings</Label>
              <Textarea
                className="mt-2 font-mono text-xs"
                rows={12}
                value={JSON.stringify(form.custom_settings, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value)
                    patch({ custom_settings: parsed })
                  } catch {
                    /* ignore invalid json while typing */
                  }
                }}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className={`flex items-center gap-2 text-sm ${flashpayTheme.muted}`}>
          <span>Complétion {completion.percent}%</span>
          <div className={flashpayTheme.progressTrack}>
            <div
              className="h-full bg-[#D4A24C] transition-all"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="xl:col-span-1">
        <DevicePreviewPanel
          form={form}
          activeTab={activeTab}
          networkName={selectedNetwork?.nom}
          onPushConfig={mode === "edit" ? onPushConfig : undefined}
          pushing={pushing}
        />
      </div>

      <AlertDialog open={showPresetConfirm} onOpenChange={setShowPresetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Appliquer le preset ?</AlertDialogTitle>
            <AlertDialogDescription>
              La configuration USSD actuelle sera remplacée par le template sélectionné.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => presetId && applyPreset(presetId)}>
              Appliquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

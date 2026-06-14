"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
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
import { Sparkles, Upload, Check, ChevronsUpDown, Loader2 } from "lucide-react"
import type { DeviceFormValues, FlashPayDeviceConfig, OperationTab } from "@/lib/types/flashpay-device"
import { DEVICE_PRESETS } from "@/lib/flashpay-device-sample"
import {
  applyFlashpayConfigImport,
  computeCompletion,
  formatDeviceMode,
  getRequiredUssdOperations,
  compactCustomSettings,
  createEmptyFlashpayConfig,
  flashpayTheme,
  isSampleForm,
  networkChipClass,
} from "@/lib/flashpay-device-utils"
import { UssdFlowBuilder } from "@/components/flashpay-devices/ussd-flow-builder"
import { DevicePreviewPanel } from "@/components/flashpay-devices/device-preview-panel"
import { AdvancedSettingsEditor } from "@/components/flashpay-devices/advanced-settings-editor"
import { fetchAdminUsers, fetchNetworks } from "@/lib/flashpay-device-api"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface DeviceFormProps {
  form: DeviceFormValues
  onChange: (form: DeviceFormValues) => void
  mode: "create" | "edit"
  apiFetch: ReturnType<typeof import("@/lib/useApi").useApi>
  clonedFrom?: string
  ownerLabel?: string
  onPushConfig?: () => void
  pushing?: boolean
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <section className={cn(flashpayTheme.card, "p-5 space-y-4")}>
      <div>
        <h2 className="text-lg font-semibold text-[#0B2545] dark:text-gray-100">{title}</h2>
        {description && <p className={cn(flashpayTheme.mutedXs, "mt-1")}>{description}</p>}
      </div>
      {children}
    </section>
  )
}

const OPERATION_LABELS: Record<OperationTab, string> = {
  deposit: "Dépôt",
  withdraw: "Retrait",
  balance: "Solde",
}

export function DeviceForm({
  form,
  onChange,
  mode,
  apiFetch,
  clonedFrom,
  ownerLabel,
  onPushConfig,
  pushing,
}: DeviceFormProps) {
  const { toast } = useToast()
  const [users, setUsers] = useState<any[]>([])
  const [networks, setNetworks] = useState<any[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [userSearchError, setUserSearchError] = useState("")
  const [presetId, setPresetId] = useState<string | null>(null)
  const [showPresetConfirm, setShowPresetConfirm] = useState(false)

  const fp = form.custom_settings.flashpay
  const completion = computeCompletion(form)
  const sample = isSampleForm(form)

  useEffect(() => {
    fetchNetworks(apiFetch).then(setNetworks).catch(() => setNetworks([]))
  }, [apiFetch])

  useEffect(() => {
    setLoadingUsers(true)
    setUserSearchError("")
    const t = setTimeout(() => {
      fetchAdminUsers(apiFetch, userSearch)
        .then(setUsers)
        .catch(() => {
          setUsers([])
          setUserSearchError("Impossible de charger les utilisateurs.")
        })
        .finally(() => setLoadingUsers(false))
    }, 300)
    return () => clearTimeout(t)
  }, [apiFetch, userSearch])

  const selectedUser = useMemo(
    () => users.find((u) => u.uid === form.user),
    [users, form.user],
  )

  const selectedUserLabel = useMemo(() => {
    if (!form.user) return null
    if (selectedUser) {
      return selectedUser.display_name || selectedUser.email || selectedUser.phone || form.user
    }
    return ownerLabel || form.user
  }, [form.user, selectedUser, ownerLabel])

  const selectedNetwork = useMemo(
    () => networks.find((n) => n.uid === form.network),
    [networks, form.network],
  )

  const patch = (partial: Partial<DeviceFormValues>) => onChange({ ...form, ...partial })

  const patchFlashpay = (partial: Partial<FlashPayDeviceConfig>) => {
    const base = fp ?? createEmptyFlashpayConfig()
    onChange({
      ...form,
      custom_settings: compactCustomSettings({
        ...form.custom_settings,
        flashpay: { ...base, ...partial },
      }),
    })
  }

  const patchOperation = useCallback(
    (tab: OperationTab, steps: string[]) => {
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
    },
    [form, fp, onChange],
  )

  const applyPreset = (presetId: string) => {
    const preset = DEVICE_PRESETS.find((p) => p.id === presetId)
    if (!preset) return
    onChange({
      ...form,
      custom_settings: compactCustomSettings({
        ...form.custom_settings,
        flashpay: structuredClone(preset.config),
        flashpay_updated_at: new Date().toISOString(),
      }),
    })
    setPresetId(null)
    setShowPresetConfirm(false)
  }

  const configFileInputRef = useRef<HTMLInputElement>(null)

  const handleConfigFileUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const text = String(reader.result ?? "")
      const { form: next, error } = applyFlashpayConfigImport(text, form)
      if (error) {
        toast({ title: "Import échoué", description: error, variant: "destructive" })
        return
      }
      onChange(next)
      const importedPin = next.custom_settings.flashpay?.momo_pin?.trim()
      toast({
        title: "Config importée",
        description: importedPin
          ? `${file.name} — formulaire rempli.`
          : `${file.name} — PIN non importé, saisissez-le avant d'enregistrer.`,
      })
    }
    reader.readAsText(file)
    if (configFileInputRef.current) configFileInputRef.current.value = ""
  }

  const renderOperationBlock = (tab: OperationTab) => {
    if (!fp) return null
    const steps = fp[tab]?.ussd_steps ?? []
    const stepCount = steps.filter((s) => s.trim()).length

    return (
      <div
        key={tab}
        className="rounded-xl border border-slate-200 dark:border-gray-600 bg-slate-50/50 dark:bg-gray-900/30 p-4 space-y-4"
      >
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {OPERATION_LABELS[tab]}
          </h3>
          <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-200">
            {stepCount} étape{stepCount > 1 ? "s" : ""}
          </Badge>
        </div>

        <UssdFlowBuilder steps={steps} onChange={(next) => patchOperation(tab, next)} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800/80 p-3">
            <span className="text-sm text-gray-900 dark:text-gray-200">Session multi-écrans</span>
            <Switch
              checked={fp[tab]?.session_type === "multi"}
              onCheckedChange={(v) =>
                patchFlashpay({
                  [tab]: {
                    ...fp[tab],
                    session_type: v ? "multi" : "single",
                  },
                } as Partial<FlashPayDeviceConfig>)
              }
            />
          </div>
          {tab === "deposit" && (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-gray-600 bg-white dark:bg-gray-800/80 p-3">
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

        {tab === "deposit" && fp.deposit.auto_transfer_enabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Destination auto-transfer</Label>
              <Input
                className="mt-1 bg-white dark:bg-gray-900"
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
                className="mt-1 bg-white dark:bg-gray-900"
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
      </div>
    )
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

        <FormSection
          title="Identité & rattachement"
          description="Identifiant du téléphone, agent propriétaire et réseau MoMo."
        >
          <div>
            <Label>device_id</Label>
            <Input
              className={cn(
                "font-mono mt-1 bg-white dark:bg-gray-900",
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
              className="mt-1 bg-white dark:bg-gray-900"
              value={form.device_name}
              onChange={(e) => patch({ device_name: e.target.value })}
              placeholder="Ex. Téléphone Moov SIM1"
            />
          </div>
          <div>
            <Label>Propriétaire (agent)</Label>
            <p className={`${flashpayTheme.mutedXs} mt-1 mb-2`}>
              Compte utilisateur (UUID) qui se connectera sur le téléphone FlashPay — recherche par nom, email ou téléphone.
            </p>
            <Popover open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={userDropdownOpen}
                  className={cn(
                    "w-full justify-between font-normal mt-1",
                    !form.user && "text-muted-foreground",
                  )}
                >
                  <span className="truncate text-left">
                    {selectedUserLabel || "Sélectionner un agent…"}
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Rechercher par email, nom ou téléphone…"
                    value={userSearch}
                    onValueChange={setUserSearch}
                  />
                  <CommandList className="max-h-56 overflow-y-auto">
                    <CommandEmpty>
                      {loadingUsers ? (
                        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Recherche…
                        </div>
                      ) : userSearchError ? (
                        userSearchError
                      ) : (
                        "Aucun utilisateur trouvé."
                      )}
                    </CommandEmpty>
                    <CommandGroup>
                      {!loadingUsers &&
                        users.map((u) => (
                          <CommandItem
                            key={u.uid}
                            value={u.uid}
                            onSelect={() => {
                              patch({ user: u.uid })
                              setUserDropdownOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                form.user === u.uid ? "opacity-100" : "opacity-0",
                              )}
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium truncate">
                                {u.display_name || u.email || u.phone || u.uid}
                              </span>
                              {(u.email || u.phone) && (
                                <span className={`${flashpayTheme.mutedXs} truncate`}>
                                  {[u.email, u.phone].filter(Boolean).join(" · ")}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {form.user && (
              <p className={`${flashpayTheme.mutedXs} mt-2 font-mono break-all`}>UUID : {form.user}</p>
            )}
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
                    flashpayTheme.networkTile,
                    form.network === n.uid ? flashpayTheme.networkSelected : flashpayTheme.unselectedTile,
                  )}
                >
                  <span className={cn("inline-block px-2 py-0.5 rounded text-xs border mb-1 font-semibold", networkChipClass(n.code))}>
                    {n.code}
                  </span>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{n.nom}</p>
                  <p className={flashpayTheme.mutedXs}>{n.country_name}</p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>Slot SIM</Label>
            <div className="flex gap-2 mt-2">
              {([0, 1] as const).map((slot) => {
                const selected = (fp?.sim_slot ?? 0) === slot
                return (
                  <Button
                    key={slot}
                    type="button"
                    variant="outline"
                    className={cn(
                      "min-w-[5.5rem] font-semibold",
                      selected ? flashpayTheme.simActive : flashpayTheme.simInactive,
                    )}
                    onClick={() => patchFlashpay({ sim_slot: slot })}
                  >
                    SIM {slot + 1}
                  </Button>
                )
              })}
            </div>
          </div>
        </FormSection>

        <FormSection
          title="Config FlashPay"
          description="Séquences USSD pour dépôt, retrait et solde. Importez un JSON FlashPay ou yapson pour pré-remplir."
        >
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="border-slate-300 dark:border-gray-600"
              onClick={() => configFileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Importer une config
            </Button>
            <input
              ref={configFileInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => handleConfigFileUpload(e.target.files?.[0] ?? null)}
            />
            <span className={flashpayTheme.mutedXs}>
              Formats acceptés : FlashPay (<code className="text-xs">{"{ flashpay: … }"}</code>) ou yapson legacy.
            </span>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label>Pays</Label>
              <Input
                className="mt-1 bg-white dark:bg-gray-900"
                value={fp?.country_code || ""}
                onChange={(e) => patchFlashpay({ country_code: e.target.value.toUpperCase() })}
              />
            </div>
            <div>
              <Label>PIN MoMo</Label>
              <Input
                className="mt-1 font-mono bg-white dark:bg-gray-900"
                type="password"
                value={fp?.momo_pin || ""}
                onChange={(e) => patchFlashpay({ momo_pin: e.target.value })}
              />
            </div>
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
            <div className="space-y-4">
              {(["deposit", "withdraw", "balance"] as OperationTab[]).map(renderOperationBlock)}
            </div>
          )}
        </FormSection>

        <FormSection title="Avancé" description="Édition JSON brute de custom_settings (réservé aux cas particuliers).">
          <AdvancedSettingsEditor
            settings={form.custom_settings}
            onApply={(settings) => patch({ custom_settings: settings })}
          />
        </FormSection>

        <div className={`flex flex-col gap-1 text-sm ${flashpayTheme.muted}`}>
          <div className="flex items-center gap-2">
            <span>
              Complétion {completion.percent}% · Mode {formatDeviceMode(completion.mode)}
            </span>
            <span className="text-xs">
              ({completion.done}/{completion.total})
            </span>
          </div>
          <p className="text-xs">
            USSD requis :{" "}
            {getRequiredUssdOperations(completion.mode)
              .map((op) => (op === "deposit" ? "dépôt" : "retrait"))
              .join(" + ")}
          </p>
          <div className={flashpayTheme.progressTrack}>
            <div
              className="h-full bg-[#D4A24C] transition-[width] duration-200"
              style={{ width: `${completion.percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 xl:col-span-1">
        <DevicePreviewPanel
          form={form}
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

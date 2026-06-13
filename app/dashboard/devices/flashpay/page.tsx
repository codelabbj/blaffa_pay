"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Copy,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Smartphone,
  Sparkles,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { DevicePickerDrawer } from "@/components/flashpay-devices/device-picker-drawer"
import {
  fetchStaffDevices,
  pushDeviceConfig,
  toggleDevicePause,
} from "@/lib/flashpay-device-api"
import type { DeviceKpiFilter, PaymentDevice } from "@/lib/types/flashpay-device"
import {
  computeCompletion,
  filterDevicesByKpi,
  flashpayTheme,
  formatDeviceMode,
  formatRelativeTime,
  isDeviceConfigured,
  isDeviceEffectivelyOnline,
  networkChipClass,
  networkInitials,
  ussdConfigSummary,
} from "@/lib/flashpay-device-utils"

function StatusDot({ device }: { device: PaymentDevice }) {
  if (device.is_paused) {
    return (
      <span className="inline-flex items-center gap-1 text-orange-600 dark:text-orange-400 text-xs font-medium">
        ⏸ Pause
      </span>
    )
  }
  if (isDeviceEffectivelyOnline(device)) {
    return (
      <span className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 text-xs font-medium">
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" /> En ligne
      </span>
    )
  }
  return <span className="inline-flex items-center gap-1 text-slate-400 dark:text-gray-500 text-xs">○ Hors ligne</span>
}

export default function FlashPayDevicesPage() {
  const apiFetch = useApi()
  const router = useRouter()
  const { toast } = useToast()
  const [devices, setDevices] = useState<PaymentDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [kpiFilter, setKpiFilter] = useState<DeviceKpiFilter>("all")
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true)
    }
    setError("")
    try {
      const params: Record<string, string> = {}
      if (debouncedSearch) params.search = debouncedSearch
      const data = await fetchStaffDevices(apiFetch, params)
      setDevices(data)
    } catch (e: any) {
      if (!opts?.silent) {
        setError(extractErrorMessages(e) || "Impossible de charger les devices")
        setDevices([])
      }
    } finally {
      if (!opts?.silent) {
        setLoading(false)
      }
    }
  }, [apiFetch, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  /** Rafraîchissement léger du statut en ligne (sans spinner). */
  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        load({ silent: true })
      }
    }, 30_000)
    return () => clearInterval(id)
  }, [load])

  const filtered = useMemo(() => filterDevicesByKpi(devices, kpiFilter), [devices, kpiFilter])

  const kpis = useMemo(
    () => ({
      total: devices.length,
      online: devices.filter((d) => isDeviceEffectivelyOnline(d)).length,
      paused: devices.filter((d) => d.is_paused).length,
      unconfigured: devices.filter((d) => !isDeviceConfigured(d)).length,
    }),
    [devices],
  )

  const handlePush = async (device: PaymentDevice) => {
    try {
      await pushDeviceConfig(apiFetch, device.device_id)
    } catch (e: any) {
      toast({ title: "Erreur", description: extractErrorMessages(e), variant: "destructive" })
    }
  }

  const handlePauseToggle = async (device: PaymentDevice) => {
    try {
      await toggleDevicePause(apiFetch, device, !device.is_paused)
      toast({ title: device.is_paused ? "Device repris" : "Device en pause" })
      load()
    } catch (e: any) {
      toast({ title: "Erreur", description: extractErrorMessages(e), variant: "destructive" })
    }
  }

  return (
    <div className={flashpayTheme.page}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className={flashpayTheme.title}>Appareils FlashPay</h1>
            <p className={`${flashpayTheme.muted} mt-1`}>
              Gérez les téléphones agents et leurs configs MoMo
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className={flashpayTheme.navyOutline} onClick={() => setPickerOpen(true)}>
              <Copy className="h-4 w-4 mr-2" /> Depuis modèle
            </Button>
            <Button className={flashpayTheme.accentBtn} asChild>
              <Link href="/dashboard/devices/flashpay/new">
                <Plus className="h-4 w-4 mr-2" /> Nouveau
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {(
            [
              ["all", "Total", kpis.total],
              ["online", "En ligne", kpis.online],
              ["paused", "En pause", kpis.paused],
              ["unconfigured", "Non configuré", kpis.unconfigured],
            ] as const
          ).map(([key, label, value]) => (
            <button
              key={key}
              type="button"
              onClick={() => setKpiFilter(key)}
              className={flashpayTheme.kpiCard(kpiFilter === key)}
            >
              <p className="text-2xl font-bold text-[#0B2545] dark:text-gray-100">{value}</p>
              <p className={flashpayTheme.muted}>{label}</p>
            </button>
          ))}
        </div>

        <Card className={flashpayTheme.card}>
          <CardContent className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-gray-500" />
              <Input
                className="pl-9 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                placeholder="Rechercher device_id, nom, agent, email, téléphone, réseau…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={load}>
              <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
            </Button>
          </CardContent>
        </Card>

        <Card className={`${flashpayTheme.card} overflow-hidden`}>
          <CardHeader className={flashpayTheme.cardHeader}>
            <CardTitle className="text-[#0B2545] dark:text-gray-100 flex items-center gap-2">
              <Smartphone className="h-5 w-5" /> Liste ({filtered.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6">
                <ErrorDisplay error={error} onRetry={load} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center">
                <Sparkles className="h-10 w-10 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-gray-300 font-medium">Aucun appareil</p>
                <Button className={`mt-4 ${flashpayTheme.accentBtn}`} asChild>
                  <Link href="/dashboard/devices/flashpay/new">Créer le premier</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statut</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Réseau</TableHead>
                    <TableHead>Config</TableHead>
                    <TableHead>Activité</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((device) => (
                    <TableRow
                      key={device.uid}
                      className={flashpayTheme.tableRowHover}
                      onClick={() => router.push(`/dashboard/devices/flashpay/${device.uid}`)}
                    >
                      <TableCell>
                        <StatusDot device={device} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#0B2545] text-white text-xs font-bold flex items-center justify-center">
                            {networkInitials(device.network_name, device.custom_settings?.flashpay?.network_code)}
                          </div>
                          <div>
                            <p className="font-semibold text-[#0B2545] dark:text-gray-100">{device.device_name || "—"}</p>
                            <p className="font-mono text-xs text-slate-500 dark:text-gray-400">{device.device_id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-900 dark:text-gray-200">{device.user_name || "—"}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={networkChipClass(device.custom_settings?.flashpay?.network_code)}>
                          {device.network_name || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {(() => {
                          const progress = computeCompletion(device)
                          return isDeviceConfigured(device) ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/30">
                              {progress.percent}% · {formatDeviceMode(device.mode)} · {ussdConfigSummary(device)}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-amber-300 text-amber-800 dark:border-amber-700 dark:text-amber-300">
                              {progress.percent}% · {formatDeviceMode(device.mode)}
                            </Badge>
                          )
                        })()}
                      </TableCell>
                      <TableCell className={`text-sm ${flashpayTheme.muted}`}>{formatRelativeTime(device.last_seen)}</TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/devices/flashpay/${device.uid}`)}>
                              Ouvrir
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/devices/flashpay/new?from=${device.uid}`)}>
                              Dupliquer
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePush(device)}>
                              <Radio className="h-4 w-4 mr-2" /> Pousser config
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handlePauseToggle(device)}>
                              <span className="inline-flex items-center">
                                {device.is_paused ? (
                                  <Play className="h-4 w-4 mr-2" />
                                ) : (
                                  <Pause className="h-4 w-4 mr-2" />
                                )}
                                {device.is_paused ? "Reprendre" : "Mettre en pause"}
                              </span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <DevicePickerDrawer
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        devices={devices}
        onSelect={(d) => router.push(`/dashboard/devices/flashpay/new?from=${d.uid}`)}
      />
    </div>
  )
}

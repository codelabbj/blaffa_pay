"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Activity, AlertTriangle, CheckCircle2, FileText, RefreshCw, Smartphone, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApi } from "@/lib/useApi"

/** Événement envoyé par l'app (HealthEvents) — voir flashpay_backend payment/device_health.py */
type HealthEvent = {
  kind: string
  label: string
  incident: boolean
  message: string
  at: string
  device_id: string
  device_name?: string
  user?: string
  app_version?: string
  model?: string
  android?: string
  details?: Record<string, string>
}

type DeviceRow = {
  device_id: string
  device_name: string
  user: string
  model: string
  app_version: string
  counts: Record<string, number>
  incidents: number
  last_event: HealthEvent | null
  last_incident: HealthEvent | null
  last_status: { ok: boolean; at: string; label: string } | null
}

const SINCE = [
  { value: "1h", label: "1 heure" },
  { value: "24h", label: "24 heures" },
  { value: "7d", label: "7 jours" },
  { value: "30d", label: "30 jours" },
]

const KEY_COUNTS: Array<{ kind: string; short: string }> = [
  { kind: "accessibility_frozen", short: "Figée" },
  { kind: "accessibility_not_bound", short: "Coupée" },
  { kind: "ussd_phantom", short: "Fantôme" },
  { kind: "accessibility_restarted", short: "Réparée" },
  { kind: "crash", short: "Crash" },
]

function fmt(at?: string) {
  if (!at) return "—"
  const d = new Date(at)
  if (Number.isNaN(d.getTime())) return at
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit" })
}

function ago(at?: string) {
  if (!at) return ""
  const s = Math.round((Date.now() - new Date(at).getTime()) / 1000)
  if (s < 60) return `il y a ${s} s`
  if (s < 3600) return `il y a ${Math.round(s / 60)} min`
  if (s < 86400) return `il y a ${Math.round(s / 3600)} h`
  return `il y a ${Math.round(s / 86400)} j`
}

function kindTone(e: HealthEvent) {
  if (e.kind === "accessibility_restarted" || e.kind === "accessibility_connected") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300"
  if (e.kind === "crash" || e.kind === "accessibility_frozen" || e.kind === "accessibility_not_bound")
    return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"
  if (e.incident) return "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
  return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
}

export default function DeviceHealthPage() {
  const apiFetch = useApi()
  const [since, setSince] = useState("24h")
  const [device, setDevice] = useState<string>("all")
  const [onlyIncidents, setOnlyIncidents] = useState(true)
  const [rows, setRows] = useState<DeviceRow[]>([])
  const [events, setEvents] = useState<HealthEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [logFor, setLogFor] = useState<string | null>(null)
  const [logText, setLogText] = useState("")
  const [logLoading, setLogLoading] = useState(false)
  const [logFilter, setLogFilter] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({ since, limit: "300" })
      if (device !== "all") params.set("device_id", device)
      if (onlyIncidents) params.set("incidents", "1")
      const [summary, list] = await Promise.all([
        apiFetch(`payments/admin/device-health/summary/?since=${since}`),
        apiFetch(`payments/admin/device-health/?${params.toString()}`),
      ])
      setRows(summary?.results || [])
      setEvents(list?.results || [])
    } catch (e: any) {
      setError(e?.message || "Chargement impossible")
    } finally {
      setLoading(false)
    }
  }, [apiFetch, since, device, onlyIncidents])

  useEffect(() => {
    void load()
  }, [load])

  async function openLog(deviceId: string) {
    setLogFor(deviceId)
    setLogText("")
    setLogLoading(true)
    try {
      const res = await apiFetch(`payments/admin/device-health/${encodeURIComponent(deviceId)}/log/?kb=400`)
      setLogText(res?.text || "")
    } catch (e: any) {
      setLogText(`Erreur : ${e?.message || e}`)
    } finally {
      setLogLoading(false)
    }
  }

  // Lignes utiles pour l'accessibilité / USSD : erreurs, HEALTH, accessibilité, sessions fantômes.
  const shownLog = useMemo(() => {
    if (!logFilter) return logText
    return logText
      .split("\n")
      .filter((l) =>
        /\[HEALTH\]|accessibilit|fantôme|figé|Exception|💥|❌|⛔|✅ Service|Auto-réparation|nouvelle session USSD|CRASH/i.test(l),
      )
      .join("\n")
  }, [logText, logFilter])

  const totals = useMemo(() => {
    const t = { devices: rows.length, troubled: 0, frozen: 0, phantom: 0, repaired: 0, crash: 0 }
    for (const r of rows) {
      if (r.incidents > 0) t.troubled += 1
      t.frozen += (r.counts.accessibility_frozen || 0) + (r.counts.accessibility_not_bound || 0)
      t.phantom += r.counts.ussd_phantom || 0
      t.repaired += r.counts.accessibility_restarted || 0
      t.crash += r.counts.crash || 0
    }
    return t
  }, [rows])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" /> Santé des téléphones
          </h1>
          <p className="text-sm text-muted-foreground">
            Accessibilité coupée ou figée, sessions USSD fantômes, réparations automatiques et crashs, envoyés par
            l’application FlashPay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={since} onValueChange={setSince}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SINCE.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => void load()} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Actualiser
          </Button>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Téléphones avec incident", value: `${totals.troubled} / ${totals.devices}`, icon: <Smartphone className="h-4 w-4" /> },
          { label: "Accessibilité coupée / figée", value: totals.frozen, icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
          { label: "Sessions USSD fantômes", value: totals.phantom, icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
          { label: "Réparations automatiques", value: totals.repaired, icon: <Wrench className="h-4 w-4 text-emerald-500" /> },
          { label: "Crashs", value: totals.crash, icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
        ].map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {k.icon}
                {k.label}
              </div>
              <div className="mt-1 text-2xl font-bold">{k.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Par téléphone</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Téléphone</TableHead>
                <TableHead>État accessibilité</TableHead>
                {KEY_COUNTS.map((k) => (
                  <TableHead key={k.kind} className="text-center">
                    {k.short}
                  </TableHead>
                ))}
                <TableHead>Dernier incident</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                    {loading ? "Chargement…" : "Aucun événement reçu sur la période (app à jour requise)."}
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => (
                  <TableRow key={r.device_id} className={r.incidents ? "" : "opacity-80"}>
                    <TableCell>
                      <div className="font-medium">
                        {r.device_name || r.device_id} <span className="text-xs text-muted-foreground">#{r.device_id}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {r.user} · {r.model} · v{r.app_version}
                      </div>
                    </TableCell>
                    <TableCell>
                      {r.last_status ? (
                        <span className="inline-flex items-center gap-1 text-sm">
                          {r.last_status.ok ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                          {r.last_status.ok ? "OK" : "En panne"}
                          <span className="text-xs text-muted-foreground">({ago(r.last_status.at)})</span>
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    {KEY_COUNTS.map((k) => (
                      <TableCell key={k.kind} className="text-center tabular-nums">
                        {r.counts[k.kind] ? <b>{r.counts[k.kind]}</b> : <span className="text-muted-foreground">0</span>}
                      </TableCell>
                    ))}
                    <TableCell className="max-w-[280px]">
                      {r.last_incident ? (
                        <>
                          <div className="text-sm truncate">{r.last_incident.label}</div>
                          <div className="text-xs text-muted-foreground">{fmt(r.last_incident.at)}</div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">Aucun</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button size="sm" variant="ghost" onClick={() => setDevice(r.device_id)}>
                        Événements
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void openLog(r.device_id)}>
                        <FileText className="h-4 w-4 mr-1" /> Journal
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-base">
            Événements {device !== "all" ? `· #${device}` : ""} ({events.length})
          </CardTitle>
          <div className="flex items-center gap-2">
            {device !== "all" ? (
              <Button size="sm" variant="outline" onClick={() => setDevice("all")}>
                Tous les téléphones
              </Button>
            ) : null}
            <Button size="sm" variant={onlyIncidents ? "default" : "outline"} onClick={() => setOnlyIncidents((v) => !v)}>
              {onlyIncidents ? "Incidents seulement" : "Tous les événements"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Heure</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Événement</TableHead>
                <TableHead>Détail</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                    {loading ? "Chargement…" : "Aucun événement."}
                  </TableCell>
                </TableRow>
              ) : (
                events.map((e, i) => (
                  <TableRow key={`${e.device_id}-${e.at}-${i}`}>
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm">{fmt(e.at)}</div>
                      <div className="text-xs text-muted-foreground">{ago(e.at)}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <div className="text-sm">{e.device_name || e.device_id}</div>
                      <div className="text-xs text-muted-foreground">{e.model}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${kindTone(e)} border-0`}>{e.label}</Badge>
                      <div className="text-xs mt-1">{e.message}</div>
                    </TableCell>
                    <TableCell className="max-w-[420px]">
                      {e.details && Object.keys(e.details).length ? (
                        <div className="text-xs font-mono text-muted-foreground break-words">
                          {Object.entries(e.details)
                            .map(([k, v]) => `${k}=${v}`)
                            .join(" · ")}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={logFor !== null} onOpenChange={(o) => !o && setLogFor(null)}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Journal du téléphone #{logFor}</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-between gap-2 text-sm">
            <span className="text-muted-foreground">
              {logFilter ? "Lignes accessibilité / USSD / erreurs" : "Journal complet (fin)"}
            </span>
            <Button size="sm" variant="outline" onClick={() => setLogFilter((v) => !v)}>
              {logFilter ? "Tout afficher" : "Filtrer"}
            </Button>
          </div>
          <pre className="max-h-[65vh] overflow-auto rounded-md bg-muted p-3 text-xs whitespace-pre-wrap break-words">
            {logLoading ? "Chargement…" : shownLog || "Aucune ligne correspondante."}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  )
}

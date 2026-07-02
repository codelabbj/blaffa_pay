"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, MessageSquare, Plus, RefreshCw, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { extractErrorMessages } from "@/components/ui/error-display"
import {
  createOutboundSmsJob,
  fetchNetworks,
  fetchOutboundSmsJobs,
  fetchStaffDevices,
  type OutboundSmsJob,
} from "@/lib/flashpay-device-api"
import { flashpayTheme, isSmsSenderDevice } from "@/lib/flashpay-device-utils"
import type { PaymentDevice } from "@/lib/types/flashpay-device"

const STATUS_VARIANT: Record<string, string> = {
  pending: "border-amber-300 text-amber-800",
  claimed: "border-blue-300 text-blue-800",
  sent: "border-green-300 text-green-800",
  failed: "border-red-300 text-red-800",
  cancelled: "border-slate-300 text-slate-600",
}

export default function OutboundSmsPage() {
  const apiFetch = useApi()
  const { toast } = useToast()
  const [jobs, setJobs] = useState<OutboundSmsJob[]>([])
  const [devices, setDevices] = useState<PaymentDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [deviceUid, setDeviceUid] = useState("")
  const [networkUid, setNetworkUid] = useState("")
  const [networks, setNetworks] = useState<{ uid: string; nom: string; code?: string }[]>([])
  const [toPhone, setToPhone] = useState("")
  const [message, setMessage] = useState("")

  const smsDevices = useMemo(() => {
    let list = devices.filter(isSmsSenderDevice)
    if (networkUid) list = list.filter((d) => d.network === networkUid)
    return list
  }, [devices, networkUid])

  const smsNetworks = useMemo(() => {
    const ids = new Set(devices.filter(isSmsSenderDevice).map((d) => d.network).filter(Boolean))
    return networks.filter((n) => ids.has(n.uid))
  }, [devices, networks])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [jobList, deviceList, networkList] = await Promise.all([
        fetchOutboundSmsJobs(apiFetch, statusFilter !== "all" ? { status: statusFilter } : undefined),
        fetchStaffDevices(apiFetch),
        fetchNetworks(apiFetch),
      ])
      setJobs(jobList)
      setDevices(deviceList)
      setNetworks(networkList)
    } catch (e: unknown) {
      toast({ title: "Erreur", description: extractErrorMessages(e), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [apiFetch, statusFilter, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!toPhone.trim() || !message.trim()) {
      toast({ title: "Validation", description: "Numéro et message requis", variant: "destructive" })
      return
    }
    setSending(true)
    try {
      await createOutboundSmsJob(apiFetch, {
        to_phone: toPhone.trim(),
        message: message.trim(),
        ...(deviceUid ? { device: deviceUid } : {}),
        ...(networkUid && !deviceUid ? { network: networkUid } : {}),
      })
      setToPhone("")
      setMessage("")
      load()
    } catch (e: unknown) {
      toast({ title: "Erreur", description: extractErrorMessages(e), variant: "destructive" })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={flashpayTheme.page}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-start gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/devices/flashpay">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className={flashpayTheme.title}>SMS sortants</h1>
              <p className={flashpayTheme.muted}>
                File d&apos;envoi traitée par les devices FlashPay émetteurs SMS
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => load()}>
            <RefreshCw className="h-4 w-4 mr-2" /> Actualiser
          </Button>
        </div>

        <Card className={flashpayTheme.card}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B2545] dark:text-gray-100">
              <Send className="h-5 w-5" /> Nouvelle demande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Réseau émetteur (optionnel)</Label>
                <Select
                  value={networkUid || "__auto__"}
                  onValueChange={(v) => {
                    const next = v === "__auto__" ? "" : v
                    setNetworkUid(next)
                    if (next && deviceUid) {
                      const dev = devices.find((d) => d.uid === deviceUid)
                      if (dev?.network && dev.network !== next) setDeviceUid("")
                    }
                  }}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Tous réseaux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Tous réseaux — premier device dispo</SelectItem>
                    {smsNetworks.map((n) => (
                      <SelectItem key={n.uid} value={n.uid}>
                        {n.nom} {n.code ? `(${n.code})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className={`${flashpayTheme.mutedXs} mt-2`}>
                  Laissez vide pour le premier émetteur SMS disponible. Utile si plusieurs SIM (Orange, Moov…).
                </p>
              </div>
              <div>
                <Label>Device émetteur (optionnel)</Label>
                <Select value={deviceUid || "__auto__"} onValueChange={(v) => setDeviceUid(v === "__auto__" ? "" : v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Auto — par réseau ou premier dispo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__auto__">Auto — par réseau ou premier dispo</SelectItem>
                    {smsDevices.map((d) => (
                      <SelectItem key={d.uid} value={d.uid}>
                        {d.device_name || d.device_id}
                        {d.network_name ? ` · ${d.network_name}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {smsDevices.length === 0 && (
                  <p className={`${flashpayTheme.mutedXs} mt-2`}>
                    Aucun device émetteur SMS pour ce filtre.
                  </p>
                )}
              </div>
            </div>
            <div>
              <Label>Destinataire</Label>
              <Input className="mt-1" placeholder="+22670123456" value={toPhone} onChange={(e) => setToPhone(e.target.value)} />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea className="mt-1 min-h-[100px]" value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>
            <Button className={flashpayTheme.accentBtn} onClick={handleCreate} disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Créer la demande
            </Button>
          </CardContent>
        </Card>

        <Card className={flashpayTheme.card}>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-[#0B2545] dark:text-gray-100">
              <MessageSquare className="h-5 w-5" /> File ({jobs.length})
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="claimed">Pris en charge</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="failed">Échec</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className={`h-8 w-8 animate-spin ${flashpayTheme.spinner}`} />
              </div>
            ) : jobs.length === 0 ? (
              <p className={`text-center py-12 ${flashpayTheme.muted}`}>Aucune demande SMS</p>
            ) : (
              <div className="space-y-3">
                {jobs.map((job) => (
                  <div key={job.uid} className="rounded-lg border border-slate-200 dark:border-gray-600 p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2 justify-between">
                      <p className="font-mono text-sm font-semibold">{job.to_phone}</p>
                      <Badge variant="outline" className={STATUS_VARIANT[job.status] ?? ""}>
                        {job.status_display || job.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{job.message}</p>
                    <p className={`text-xs ${flashpayTheme.muted}`}>
                      {job.device_id ? `Device: ${job.device_id}` : "Device: auto"}
                      {job.network_name ? ` · ${job.network_name}` : ""}
                      {job.error_message ? ` · ${job.error_message}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

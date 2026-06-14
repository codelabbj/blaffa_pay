"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Copy, Loader2, MoreHorizontal, Pause, Play, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DeviceForm } from "@/components/flashpay-devices/device-form"
import type { DeviceFormValues } from "@/lib/types/flashpay-device"
import {
  buildStatusPatchPayload,
  computeCompletion,
  deviceToFormValues,
  flashpayTheme,
  formatDeviceMode,
  formatRelativeTime,
  validateUpdateForm,
} from "@/lib/flashpay-device-utils"
import {
  fetchDeviceByUid,
  pushDeviceConfig,
  updateDeviceStatus,
} from "@/lib/flashpay-device-api"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { extractErrorMessages } from "@/components/ui/error-display"
export default function FlashPayDeviceEditPage() {
  const { uid } = useParams<{ uid: string }>()
  const apiFetch = useApi()
  const router = useRouter()
  const { toast } = useToast()
  const [form, setForm] = useState<DeviceFormValues | null>(null)
  const [ownerLabel, setOwnerLabel] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [dirty, setDirty] = useState(false)

  const completion = useMemo(() => (form ? computeCompletion(form) : null), [form])

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const device = await fetchDeviceByUid(apiFetch, uid)
      if (!device) {
        toast({ title: "Device introuvable", variant: "destructive" })
        router.push("/dashboard/devices/flashpay")
        return
      }
      setForm(deviceToFormValues(device))
      setOwnerLabel(
        [device.user_name, device.user_email].filter(Boolean).join(" · ") || undefined,
      )
      setDirty(false)
    } catch (e: any) {
      toast({ title: "Erreur", description: extractErrorMessages(e), variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [apiFetch, uid, router, toast])

  useEffect(() => {
    load()
  }, [load])

  const handleChange = (next: DeviceFormValues) => {
    setForm(next)
    setDirty(true)
  }

  const handleSave = async () => {
    if (!form?.uid) return
    const errors = validateUpdateForm(form)
    if (errors.length) {
      toast({ title: "Validation", description: errors[0], variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      await updateDeviceStatus(apiFetch, form.uid, buildStatusPatchPayload(form))
      toast({ title: "Config enregistrée" })
      setDirty(false)
      load()
    } catch (e: any) {
      toast({ title: "Erreur", description: extractErrorMessages(e), variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handlePush = async () => {
    if (!form?.device_id) return
    setPushing(true)
    try {
      await pushDeviceConfig(apiFetch, form.device_id)
    } catch (e: any) {
      toast({ title: "Erreur", description: extractErrorMessages(e), variant: "destructive" })
    } finally {
      setPushing(false)
    }
  }

  if (loading || !form) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className={`h-8 w-8 animate-spin ${flashpayTheme.spinner}`} />
      </div>
    )
  }

  return (
    <div className={flashpayTheme.page}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${flashpayTheme.stickyHeader}`}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/dashboard/devices/flashpay">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className={flashpayTheme.titleSm}>{form.device_name || form.device_id}</h1>
              <p className={`font-mono ${flashpayTheme.mutedXs}`}>
                {form.device_id} · {form.is_online ? "En ligne" : "Hors ligne"} · {formatRelativeTime(form.last_seen)}
              </p>
              {completion && (
                <div className="mt-2 flex items-center gap-2 max-w-md">
                  <span className="text-xs text-slate-600 dark:text-gray-400 whitespace-nowrap">
                    Config {completion.percent}% · {formatDeviceMode(completion.mode)}
                  </span>
                  <div className={`${flashpayTheme.progressTrack} max-w-[140px]`}>
                    <div
                      className="h-full bg-[#D4A24C] transition-[width] duration-200"
                      style={{ width: `${completion.percent}%` }}
                    />
                  </div>
                </div>
              )}
              {dirty && <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">Modifications non enregistrées</p>}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-gray-600 px-3 py-2">
              {form.is_paused ? (
                <Pause className="h-4 w-4 text-orange-500" />
              ) : (
                <Play className="h-4 w-4 text-green-600 dark:text-green-400" />
              )}
              <span className="text-sm text-gray-900 dark:text-gray-100">
                {form.is_paused ? "En pause" : "Actif"}
              </span>
              <Switch
                checked={!form.is_paused}
                onCheckedChange={(active) => handleChange({ ...form, is_paused: !active })}
                aria-label="Activer ou mettre en pause le device"
              />
            </div>
            <Button className={flashpayTheme.accentBtn} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/dashboard/devices/flashpay/new?from=${form.uid}`)}>
                  <Copy className="h-4 w-4 mr-2" /> Dupliquer
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePush}>Pousser config mobile</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <DeviceForm
          form={form}
          onChange={handleChange}
          mode="edit"
          apiFetch={apiFetch}
          ownerLabel={ownerLabel}
          onPushConfig={handlePush}
          pushing={pushing}
        />
      </div>
    </div>
  )
}

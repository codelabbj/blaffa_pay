"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DeviceForm } from "@/components/flashpay-devices/device-form"
import { DEVICE_CREATE_SAMPLE } from "@/lib/flashpay-device-sample"
import type { DeviceFormValues } from "@/lib/types/flashpay-device"
import {
  buildCreatePayload,
  cloneDeviceAsNew,
  flashpayTheme,
  resetToSample,
  validateCreateForm,
} from "@/lib/flashpay-device-utils"
import { createDeviceStaff, fetchDeviceByUid } from "@/lib/flashpay-device-api"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { extractErrorMessages } from "@/components/ui/error-display"

function FlashPayDeviceNewContent() {
  const apiFetch = useApi()
  const router = useRouter()
  const searchParams = useSearchParams()
  const fromUid = searchParams.get("from")
  const { toast } = useToast()
  const [form, setForm] = useState<DeviceFormValues>(structuredClone(DEVICE_CREATE_SAMPLE))
  const [clonedFrom, setClonedFrom] = useState<string | undefined>()
  const [loadingClone, setLoadingClone] = useState(!!fromUid)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!fromUid) return
    setLoadingClone(true)
    fetchDeviceByUid(apiFetch, fromUid)
      .then((device) => {
        if (device) {
          setForm(cloneDeviceAsNew(device))
          setClonedFrom(device.device_id)
        }
      })
      .finally(() => setLoadingClone(false))
  }, [apiFetch, fromUid])

  const handleSave = async () => {
    const errors = validateCreateForm(form)
    if (errors.length) {
      toast({ title: "Validation", description: errors[0], variant: "destructive" })
      return
    }
    setSaving(true)
    try {
      const created = await createDeviceStaff(apiFetch, buildCreatePayload(form))
      toast({ title: "Device créé" })
      router.push(`/dashboard/devices/flashpay/${created.uid}`)
    } catch (e: any) {
      const msg = extractErrorMessages(e)
      toast({
        title: "Création impossible",
        description:
          msg +
          " — Si l'API staff POST n'est pas active, créez le device via Django Admin puis éditez la config ici.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loadingClone) {
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
              <h1 className={flashpayTheme.titleSm}>
                {clonedFrom ? `Nouveau — basé sur ${clonedFrom}` : "Nouveau device FlashPay"}
              </h1>
              <p className={flashpayTheme.mutedXs}>Admin › Appareils › Nouveau</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setForm(resetToSample())}>
              Réinitialiser l&apos;exemple
            </Button>
            <Button className={flashpayTheme.accentBtn} onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Enregistrer
            </Button>
          </div>
        </div>

        <DeviceForm form={form} onChange={setForm} mode="create" clonedFrom={clonedFrom} />
      </div>
    </div>
  )
}

export default function FlashPayDeviceNewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className={`h-8 w-8 animate-spin ${flashpayTheme.spinner}`} />
        </div>
      }
    >
      <FlashPayDeviceNewContent />
    </Suspense>
  )
}

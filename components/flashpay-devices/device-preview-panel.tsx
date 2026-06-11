"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Circle, Copy, Radio } from "lucide-react"
import type { DeviceFormValues, OperationTab } from "@/lib/types/flashpay-device"
import { computeCompletion, isDeviceConfigured, stepVisualClass } from "@/lib/flashpay-device-utils"
import { useToast } from "@/hooks/use-toast"

interface DevicePreviewPanelProps {
  form: DeviceFormValues
  activeTab: OperationTab
  networkName?: string
  onPushConfig?: () => void
  pushing?: boolean
}

export function DevicePreviewPanel({
  form,
  activeTab,
  networkName,
  onPushConfig,
  pushing,
}: DevicePreviewPanelProps) {
  const { toast } = useToast()
  const fp = form.custom_settings.flashpay
  const steps = fp?.[activeTab]?.ussd_steps ?? []
  const { percent, missing } = computeCompletion(form)

  const copyId = () => {
    navigator.clipboard.writeText(form.device_id)
    toast({ title: "Copié", description: "device_id copié" })
  }

  const checklist = [
    { ok: !!form.device_id.trim(), label: "device_id unique" },
    { ok: !!form.user, label: "Agent propriétaire" },
    { ok: isDeviceConfigured(form), label: "USSD dépôt" },
    { ok: !!fp?.momo_pin?.trim(), label: "PIN MoMo" },
  ]

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#0B2545]">Aperçu mobile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-semibold">
            FlashPay — {fp?.network_label || networkName || "Réseau"} · SIM {fp?.sim_slot ?? 0}
          </p>
          <p className="text-slate-600">
            Dépôt: {(fp?.deposit?.ussd_steps?.length ?? 0)} étapes · {fp?.deposit?.session_type ?? "multi"}
          </p>
          <p className="text-slate-600">Retrait: {(fp?.withdraw?.ussd_steps?.length ?? 0)} étapes</p>
          <p className="text-slate-600">PIN: {fp?.momo_pin ? "••••" : "—"}</p>
          <Badge variant="outline" className="mt-2">
            Complétion {percent}%
          </Badge>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#0B2545]">
            Timeline USSD ({activeTab})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1.5">
            {steps.map((step, i) => (
              <span key={i} className="text-xs text-slate-400">{i > 0 ? "→" : ""}</span>
            ))}
            {steps.map((step, i) => (
              <span
                key={`s-${i}`}
                className={`inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-xs ${stepVisualClass(step)}`}
              >
                {step || "?"}
              </span>
            ))}
            {steps.length === 0 && <span className="text-sm text-slate-500">—</span>}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-[#0B2545]">Checklist déploiement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {checklist.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Circle className="h-4 w-4 text-slate-300" />
              )}
              <span className={item.ok ? "text-slate-700" : "text-slate-400"}>{item.label}</span>
            </div>
          ))}
          {missing.length > 0 && (
            <p className="text-xs text-amber-700 mt-2">Manquant : {missing.join(", ")}</p>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        {onPushConfig && form.device_id && (
          <Button
            type="button"
            variant="outline"
            className="border-[#0B2545] text-[#0B2545]"
            onClick={onPushConfig}
            disabled={pushing}
          >
            <Radio className="h-4 w-4 mr-2" />
            {pushing ? "Envoi WS…" : "Pousser config mobile"}
          </Button>
        )}
        {form.device_id && (
          <Button type="button" variant="ghost" size="sm" onClick={copyId}>
            <Copy className="h-4 w-4 mr-2" /> Copier device_id
          </Button>
        )}
      </div>
    </div>
  )
}

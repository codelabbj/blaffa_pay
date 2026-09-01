"use client"

import { Badge } from "@/components/ui/badge"
import type { WaveBusinessAccountStatus } from "@/lib/types/wave-business-account"
import { cn } from "@/lib/utils"

const STATUS_CONFIG: Record<
  WaveBusinessAccountStatus,
  { label: string; className: string }
> = {
  offline: {
    label: "Hors ligne",
    className: "bg-gray-100 text-gray-700 dark:bg-meta-4 dark:text-bodydark",
  },
  pending_otp: {
    label: "OTP en attente",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  },
  online: {
    label: "Connecté",
    className: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200",
  },
  expired: {
    label: "Session expirée",
    className: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200",
  },
}

export function AccountStatusBadge({
  status,
  className,
}: {
  status: WaveBusinessAccountStatus
  className?: string
}) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.offline
  return (
    <Badge variant="outline" className={cn("border-0 font-medium", cfg.className, className)}>
      {cfg.label}
    </Badge>
  )
}

export function ValidationModeLabel({ mode }: { mode: string }) {
  const labels: Record<string, string> = {
    notification: "Notifications",
    api_listen: "API Wave",
    both: "Notif + API",
  }
  return <span>{labels[mode] ?? mode}</span>
}

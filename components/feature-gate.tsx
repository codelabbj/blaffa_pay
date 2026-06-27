"use client"

import type { ReactNode } from "react"
import { features, type FeatureKey } from "@/lib/env-config"

type FeatureGateProps = {
  feature: FeatureKey
  children: ReactNode
}

/** Affiche children uniquement si la feature est activée (.env, défaut true). */
export function FeatureGate({ feature, children }: FeatureGateProps) {
  if (!features[feature]) return null
  return <>{children}</>
}

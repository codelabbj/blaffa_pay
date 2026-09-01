"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { Loader2, Wifi, KeyRound, MessageSquare } from "lucide-react"
import { useApi } from "@/lib/useApi"
import {
  waveAccountConnectOtp,
  waveAccountConnectPin,
  waveAccountConnectStart,
} from "@/lib/wave-business-account-api"
import type { WaveBusinessAccount } from "@/lib/types/wave-business-account"
import { extractErrorMessages } from "@/components/ui/error-display"

type Step = "start" | "pin" | "otp" | "done"

interface ConnectWizardProps {
  account: WaveBusinessAccount
  onConnected: (account: WaveBusinessAccount) => void
  onCancel?: () => void
}

export function WaveConnectWizard({ account, onConnected, onCancel }: ConnectWizardProps) {
  const apiFetch = useApi()
  const [step, setStep] = useState<Step>("start")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string[]>([])
  const [pin, setPin] = useState("")
  const [otp, setOtp] = useState("")
  const [mobileMasked, setMobileMasked] = useState(account.mobile_masked)

  const handleStart = async () => {
    setLoading(true)
    setError([])
    try {
      const res = await waveAccountConnectStart(apiFetch, account.uid)
      if (res.mobile_masked) setMobileMasked(res.mobile_masked)
      setStep("pin")
    } catch (err) {
      setError(extractErrorMessages(err))
    } finally {
      setLoading(false)
    }
  }

  const handlePin = async () => {
    if (!pin || pin.length < 4) {
      setError(["PIN requis (4 chiffres)"])
      return
    }
    setLoading(true)
    setError([])
    try {
      await waveAccountConnectPin(apiFetch, account.uid, pin)
      setStep("otp")
      setOtp("")
    } catch (err) {
      setError(extractErrorMessages(err))
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = async () => {
    if (!otp || otp.length < 4) {
      setError(["Code SMS requis"])
      return
    }
    setLoading(true)
    setError([])
    try {
      const res = await waveAccountConnectOtp(apiFetch, account.uid, otp)
      setStep("done")
      onConnected({
        ...account,
        status: "online",
        is_listening: res.is_listening,
        wallet_opaque_id: res.wallet_opaque_id,
        has_session: true,
      })
    } catch (err) {
      setError(extractErrorMessages(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-stroke bg-gray-50 p-4 dark:border-strokedark dark:bg-meta-4/30">
        <p className="text-sm font-medium text-black dark:text-white">
          {account.label || "Compte Wave"}
        </p>
        <p className="text-xs text-body dark:text-bodydark2 mt-1">
          Mobile : {mobileMasked || account.mobile}
        </p>
      </div>

      {error.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error.join(" · ")}
        </div>
      )}

      {step === "start" && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/40">
            <Wifi className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-sm text-body dark:text-bodydark2">
            Démarrez la connexion à Wave Business. Vous devrez saisir votre PIN puis le code SMS.
          </p>
          <Button onClick={handleStart} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Démarrer la connexion
          </Button>
        </div>
      )}

      {step === "pin" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <KeyRound className="h-4 w-4" />
            <span>PIN Wave Business</span>
          </div>
          <div className="space-y-2">
            <Label htmlFor="wave-pin">PIN (4 chiffres)</Label>
            <Input
              id="wave-pin"
              type="password"
              inputMode="numeric"
              maxLength={8}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="text-center text-lg tracking-widest"
            />
          </div>
          <Button onClick={handlePin} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Valider le PIN
          </Button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MessageSquare className="h-4 w-4" />
            <span>Code SMS reçu sur {mobileMasked}</span>
          </div>
          <div className="flex justify-center">
            <InputOTP maxLength={4} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleOtp} disabled={loading || otp.length < 4} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Confirmer le code
          </Button>
        </div>
      )}

      {step === "done" && (
        <div className="text-center space-y-2 py-4">
          <p className="text-green-600 dark:text-green-400 font-medium">Compte connecté</p>
          <p className="text-sm text-body dark:text-bodydark2">
            Le poll API est actif si le mode validation l&apos;inclut.
          </p>
        </div>
      )}

      {onCancel && step !== "done" && (
        <Button variant="outline" onClick={onCancel} className="w-full" disabled={loading}>
          Annuler
        </Button>
      )}
    </div>
  )
}

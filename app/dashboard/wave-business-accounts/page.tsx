"use client"

import { Suspense, useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Link2,
  Unlink,
  Trash2,
  Waves,
  Star,
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import { extractErrorMessages } from "@/components/ui/error-display"
import { fetchStaffDevices } from "@/lib/flashpay-device-api"
import type { PaymentDevice } from "@/lib/types/flashpay-device"
import type { WaveBusinessAccount, WaveValidationMode } from "@/lib/types/wave-business-account"
import { VALIDATION_MODE_OPTIONS } from "@/lib/types/wave-business-account"
import {
  createWaveBusinessAccount,
  deleteWaveBusinessAccount,
  fetchWaveBusinessAccounts,
  updateWaveBusinessAccount,
  waveAccountDisconnect,
  waveAccountPollNow,
} from "@/lib/wave-business-account-api"
import { AccountStatusBadge, ValidationModeLabel } from "@/components/wave-business/account-status-badge"
import { WaveConnectWizard } from "@/components/wave-business/connect-wizard"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

function WaveBusinessAccountsContent() {
  const apiFetch = useApi()
  const [accounts, setAccounts] = useState<WaveBusinessAccount[]>([])
  const [devices, setDevices] = useState<PaymentDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [label, setLabel] = useState("")
  const [mobile, setMobile] = useState("")
  const [validationMode, setValidationMode] = useState<WaveValidationMode>("both")
  const [isDefault, setIsDefault] = useState(false)
  const [linkedDeviceId, setLinkedDeviceId] = useState<string>("")

  const [connectOpen, setConnectOpen] = useState(false)
  const [connectAccount, setConnectAccount] = useState<WaveBusinessAccount | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [editAccount, setEditAccount] = useState<WaveBusinessAccount | null>(null)
  const [editMode, setEditMode] = useState<WaveValidationMode>("both")
  const [editListening, setEditListening] = useState(true)
  const [editSaving, setEditSaving] = useState(false)

  const loadAccounts = useCallback(async () => {
    setLoading(true)
    setError([])
    try {
      const list = await fetchWaveBusinessAccounts(apiFetch)
      setAccounts(list)
    } catch (err) {
      setError(extractErrorMessages(err))
    } finally {
      setLoading(false)
    }
  }, [apiFetch])

  const loadDevices = useCallback(async () => {
    try {
      const list = await fetchStaffDevices(apiFetch)
      setDevices(list)
    } catch {
      setDevices([])
    }
  }, [apiFetch])

  useEffect(() => {
    loadAccounts()
    loadDevices()
  }, [loadAccounts, loadDevices])

  const resetCreateForm = () => {
    setLabel("")
    setMobile("")
    setValidationMode("both")
    setIsDefault(false)
    setLinkedDeviceId("")
  }

  const handleCreate = async () => {
    if (!mobile.trim()) {
      setError(["Numéro mobile requis"])
      return
    }
    setCreateLoading(true)
    setError([])
    try {
      const created = await createWaveBusinessAccount(apiFetch, {
        label: label.trim() || undefined,
        mobile: mobile.trim(),
        validation_mode: validationMode,
        is_default: isDefault,
        linked_device_id: linkedDeviceId || undefined,
      })
      setCreateOpen(false)
      resetCreateForm()
      await loadAccounts()
      if (validationMode !== "notification") {
        setConnectAccount(created)
        setConnectOpen(true)
      }
    } catch (err) {
      setError(extractErrorMessages(err))
    } finally {
      setCreateLoading(false)
    }
  }

  const openEdit = (account: WaveBusinessAccount) => {
    setEditAccount(account)
    setEditMode(account.validation_mode)
    setEditListening(account.is_listening)
    setEditOpen(true)
  }

  const handleEditSave = async () => {
    if (!editAccount) return
    setEditSaving(true)
    try {
      await updateWaveBusinessAccount(apiFetch, editAccount.uid, {
        validation_mode: editMode,
        is_listening: editListening,
      })
      setEditOpen(false)
      await loadAccounts()
    } catch (err) {
      setError(extractErrorMessages(err))
    } finally {
      setEditSaving(false)
    }
  }

  const handleDisconnect = async (account: WaveBusinessAccount) => {
    try {
      await waveAccountDisconnect(apiFetch, account.uid)
      await loadAccounts()
    } catch (err) {
      setError(extractErrorMessages(err))
    }
  }

  const handlePoll = async (account: WaveBusinessAccount) => {
    try {
      await waveAccountPollNow(apiFetch, account.uid)
      await loadAccounts()
    } catch (err) {
      setError(extractErrorMessages(err))
    }
  }

  const handleDelete = async (account: WaveBusinessAccount) => {
    if (!confirm(`Supprimer le compte ${account.label || account.mobile_masked} ?`)) return
    try {
      await deleteWaveBusinessAccount(apiFetch, account.uid)
      await loadAccounts()
    } catch (err) {
      setError(extractErrorMessages(err))
    }
  }

  const handleSetDefault = async (account: WaveBusinessAccount) => {
    try {
      await updateWaveBusinessAccount(apiFetch, account.uid, { is_default: true })
      await loadAccounts()
    } catch (err) {
      setError(extractErrorMessages(err))
    }
  }

  const waveDevices = devices.filter(
    (d) => d.custom_settings?.flashpay?.execution_mode === "wave_business",
  )

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-black dark:text-white flex items-center gap-2">
            <Waves className="h-7 w-7 text-primary" />
            Comptes Wave Business
          </h1>
          <p className="text-sm text-body dark:text-bodydark2 mt-1">
            Connexion API Wave pour valider les transactions sans dépendre uniquement des notifications.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAccounts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualiser
          </Button>
          <Button onClick={() => { resetCreateForm(); setCreateOpen(true) }}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un compte
          </Button>
        </div>
      </div>

      {error.length > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {error.join(" · ")}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Vos comptes ({accounts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-12 text-body dark:text-bodydark2">
              Aucun compte Wave. Ajoutez-en un pour activer la validation par API.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Libellé</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Mode</TableHead>
                    <TableHead>Poll</TableHead>
                    <TableHead>Dernier poll</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow key={account.uid}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {account.is_default && (
                            <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          )}
                          {account.label || "—"}
                        </div>
                      </TableCell>
                      <TableCell>{account.mobile_masked || account.mobile}</TableCell>
                      <TableCell>
                        <AccountStatusBadge status={account.status} />
                      </TableCell>
                      <TableCell>
                        <ValidationModeLabel mode={account.validation_mode} />
                      </TableCell>
                      <TableCell>
                        {account.is_listening ? (
                          <span className="text-green-600 text-sm">Actif</span>
                        ) : (
                          <span className="text-bodydark2 text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-body dark:text-bodydark2">
                        {account.last_poll_at
                          ? format(new Date(account.last_poll_at), "dd/MM/yy HH:mm", { locale: fr })
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {account.status !== "online" && (
                              <DropdownMenuItem
                                onClick={() => {
                                  setConnectAccount(account)
                                  setConnectOpen(true)
                                }}
                              >
                                <Link2 className="h-4 w-4 mr-2" />
                                Connecter
                              </DropdownMenuItem>
                            )}
                            {account.status === "online" && (
                              <>
                                <DropdownMenuItem onClick={() => handlePoll(account)}>
                                  <RefreshCw className="h-4 w-4 mr-2" />
                                  Poll maintenant
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDisconnect(account)}>
                                  <Unlink className="h-4 w-4 mr-2" />
                                  Déconnecter
                                </DropdownMenuItem>
                              </>
                            )}
                            <DropdownMenuItem onClick={() => openEdit(account)}>
                              Modifier le mode
                            </DropdownMenuItem>
                            {!account.is_default && (
                              <DropdownMenuItem onClick={() => handleSetDefault(account)}>
                                <Star className="h-4 w-4 mr-2" />
                                Définir par défaut
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDelete(account)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau compte Wave Business</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Libellé</Label>
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ex: Wave Boutique principale"
              />
            </div>
            <div className="space-y-2">
              <Label>Mobile Wave *</Label>
              <Input
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0545633729"
              />
            </div>
            <div className="space-y-2">
              <Label>Mode de validation</Label>
              <Select
                value={validationMode}
                onValueChange={(v) => setValidationMode(v as WaveValidationMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALIDATION_MODE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-bodydark2">
                {VALIDATION_MODE_OPTIONS.find((o) => o.value === validationMode)?.description}
              </p>
            </div>
            {(validationMode === "notification" || validationMode === "both") && (
              <div className="space-y-2">
                <Label>Device FlashPay (optionnel)</Label>
                <Select value={linkedDeviceId || "_none"} onValueChange={(v) => setLinkedDeviceId(v === "_none" ? "" : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Aucun</SelectItem>
                    {waveDevices.map((d) => (
                      <SelectItem key={d.device_id} value={d.device_id}>
                        {d.device_name || d.device_id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="is-default">Compte par défaut</Label>
              <Switch id="is-default" checked={isDefault} onCheckedChange={setIsDefault} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={createLoading}>
              {createLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Connect */}
      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connexion Wave Business</DialogTitle>
          </DialogHeader>
          {connectAccount && (
            <WaveConnectWizard
              account={connectAccount}
              onConnected={() => {
                setConnectOpen(false)
                setConnectAccount(null)
                loadAccounts()
              }}
              onCancel={() => {
                setConnectOpen(false)
                setConnectAccount(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit mode */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mode de validation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Mode</Label>
              <Select value={editMode} onValueChange={(v) => setEditMode(v as WaveValidationMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {VALIDATION_MODE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editAccount?.status === "online" && editMode !== "notification" && (
              <div className="flex items-center justify-between">
                <Label>Poll API actif</Label>
                <Switch checked={editListening} onCheckedChange={setEditListening} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleEditSave} disabled={editSaving}>
              {editSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function WaveBusinessAccountsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <WaveBusinessAccountsContent />
    </Suspense>
  )
}

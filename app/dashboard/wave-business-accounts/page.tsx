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
  User,
  Check,
  ChevronsUpDown,
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import { extractErrorMessages } from "@/components/ui/error-display"
import { fetchAdminUsers } from "@/lib/flashpay-device-api"
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

interface AdminUserOption {
  uid: string
  username?: string
  email?: string
  phone?: string
  display_name?: string
}

function WaveBusinessAccountsContent() {
  const apiFetch = useApi()
  const [accounts, setAccounts] = useState<WaveBusinessAccount[]>([])
  const [isStaff, setIsStaff] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string[]>([])

  const [createOpen, setCreateOpen] = useState(false)
  const [createLoading, setCreateLoading] = useState(false)
  const [label, setLabel] = useState("")
  const [mobile, setMobile] = useState("")
  const [validationMode, setValidationMode] = useState<WaveValidationMode>("both")
  const [selectedOwnerUid, setSelectedOwnerUid] = useState("")
  const [ownerSearch, setOwnerSearch] = useState("")
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false)
  const [users, setUsers] = useState<AdminUserOption[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

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

  const loadUsers = useCallback(async (search?: string) => {
    if (!isStaff) return
    setLoadingUsers(true)
    try {
      const list = await fetchAdminUsers(apiFetch, search)
      setUsers(list)
    } catch {
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }, [apiFetch, isStaff])

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user")
      if (raw) {
        const user = JSON.parse(raw)
        setIsStaff(Boolean(user?.is_staff || user?.is_superuser))
      }
    } catch {
      setIsStaff(false)
    }
  }, [])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  useEffect(() => {
    if (createOpen && isStaff) {
      loadUsers(ownerSearch)
    }
  }, [createOpen, isStaff, ownerSearch, loadUsers])

  const resetCreateForm = () => {
    setLabel("")
    setMobile("")
    setValidationMode("both")
    setSelectedOwnerUid("")
    setOwnerSearch("")
  }

  const selectedOwner = users.find((u) => u.uid === selectedOwnerUid)

  const ownerLabel = (user: AdminUserOption) =>
    user.display_name || user.username || user.email || user.phone || user.uid

  const handleCreate = async () => {
    if (!mobile.trim()) {
      setError(["Numéro mobile requis"])
      return
    }
    if (isStaff && !selectedOwnerUid) {
      setError(["Sélectionnez l'utilisateur propriétaire du compte"])
      return
    }
    setCreateLoading(true)
    setError([])
    try {
      const created = await createWaveBusinessAccount(apiFetch, {
        label: label.trim() || undefined,
        mobile: mobile.trim(),
        validation_mode: validationMode,
        owner_uid: isStaff ? selectedOwnerUid : undefined,
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
                    {isStaff && <TableHead>Utilisateur</TableHead>}
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
                        {account.label || "—"}
                      </TableCell>
                      {isStaff && (
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span>{account.owner_username || "—"}</span>
                            <span className="text-xs text-bodydark2">
                              {account.owner_email || account.owner_uid}
                            </span>
                          </div>
                        </TableCell>
                      )}
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
            {isStaff && (
              <div className="space-y-2">
                <Label>Utilisateur propriétaire *</Label>
                <Popover open={ownerPickerOpen} onOpenChange={setOwnerPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {selectedOwner ? ownerLabel(selectedOwner) : "Sélectionner un utilisateur"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Rechercher..."
                        value={ownerSearch}
                        onValueChange={setOwnerSearch}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {loadingUsers ? "Chargement..." : "Aucun utilisateur"}
                        </CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user.uid}
                              value={user.uid}
                              onSelect={() => {
                                setSelectedOwnerUid(user.uid)
                                setOwnerPickerOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedOwnerUid === user.uid ? "opacity-100" : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span>{ownerLabel(user)}</span>
                                {(user.email || user.phone) && (
                                  <span className="text-xs text-muted-foreground">
                                    {[user.email, user.phone].filter(Boolean).join(" · ")}
                                  </span>
                                )}
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <p className="text-xs text-bodydark2 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  Le compte Wave sera lié à cet utilisateur FlashPay.
                </p>
              </div>
            )}
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

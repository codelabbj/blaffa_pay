"use client"

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { CopyButton } from "@/components/ui/copy-button"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import {
  Search, Zap, ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle,
  RefreshCw, Eye, User, Phone, DollarSign,
} from "lucide-react"

type AutoRechargeTx = {
  uid: string
  reference?: string
  external_reference?: string
  user_display_name?: string
  phone_number?: string
  amount?: string | number
  formatted_amount?: string
  fees?: string | number
  formatted_fees?: string
  total_amount?: string | number
  amount_credited?: string | number
  status?: string
  status_display?: string
  error_message?: string | null
  created_at?: string
  completed_at?: string | null
  network?: { nom?: string; code?: string }
  aggregator?: { name?: string; code?: string }
}

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "En attente" },
  { value: "initiated", label: "Initiée" },
  { value: "processing", label: "En traitement" },
  { value: "completed", label: "Succès" },
  { value: "failed", label: "Échouée" },
  { value: "cancelled", label: "Annulée" },
  { value: "expired", label: "Expirée" },
]

function formatAmount(value: unknown) {
  const n = Number(value || 0)
  if (Number.isNaN(n)) return "0"
  return n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })
}

function formatDate(iso?: string | null) {
  if (!iso) return "—"
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return "—"
  return d.toLocaleString("fr-FR")
}

function statusStyle(status?: string) {
  const key = (status || "").toLowerCase()
  if (key === "completed") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300"
  if (key === "failed" || key === "cancelled" || key === "expired") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
  if (key === "pending" || key === "initiated" || key === "processing") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
  return "bg-gray-100 text-gray-800 dark:bg-meta-4 dark:text-bodydark"
}

export default function AutoRechargePage() {
  const apiFetch = useApi()
  const { toast } = useToast()
  const itemsPerPage = 20

  const [searchTerm, setSearchTerm] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState<AutoRechargeTx[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [stats, setStats] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailTx, setDetailTx] = useState<AutoRechargeTx | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350)
    return () => clearTimeout(t)
  }, [searchTerm])

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
      })
      if (debouncedSearch) params.append("search", debouncedSearch)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (startDate) params.append("created_at__gte", startDate)
      if (endDate) params.append("created_at__lte", endDate)
      const data = await apiFetch(`auto-recharge/admin/transactions/?${params.toString()}`)
      const rows: AutoRechargeTx[] = data.results || data.transactions || []
      const count = data.count ?? rows.length
      setTransactions(rows)
      setTotalCount(count)
      setTotalPages(Math.max(1, Math.ceil(count / itemsPerPage)))
    } catch (err: any) {
      const message = extractErrorMessages(err) || "Échec du chargement des recharges automatiques"
      setError(message)
      setTransactions([])
      setTotalCount(0)
      setTotalPages(1)
      toast({ title: "Erreur", description: message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [apiFetch, currentPage, debouncedSearch, statusFilter, startDate, endDate, toast])

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiFetch("auto-recharge/admin/statistics/")
      setStats(data)
    } catch {
      setStats(null)
    }
  }, [apiFetch])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])
  useEffect(() => { fetchStats() }, [fetchStats])

  const hasActiveFilters = debouncedSearch !== "" || statusFilter !== "all" || startDate || endDate

  return (
    <div className="min-h-screen bg-whiten dark:bg-boxdark-2">
      <div className="w-full">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
            <div>
              <h1 className="text-base font-bold sm:text-2xl bg-gradient-to-r from-primary to-meta-3 bg-clip-text text-transparent">
                Recharges automatiques
              </h1>
              <p className="text-body dark:text-bodydark mt-2">
                Liste des recharges utilisateurs validées automatiquement
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white dark:bg-boxdark rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{totalCount} recharges</span>
                </div>
              </div>
              <Button onClick={() => { fetchTransactions(); fetchStats() }} disabled={loading} variant="outline" size="sm" className="gap-1.5">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Rafraîchir
              </Button>
            </div>
          </div>
        </div>

        <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-4">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-bodydark2" />
                <Input
                  placeholder="Rechercher (utilisateur, téléphone, référence)..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
                  className="pl-10 bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
                <SelectTrigger className="bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(start) => { setStartDate(start); setCurrentPage(1) }}
                onEndDateChange={(end) => { setEndDate(end); setCurrentPage(1) }}
                onClear={() => { setStartDate(null); setEndDate(null); setCurrentPage(1) }}
                placeholder="Filtrer par date"
              />
            </div>
            {hasActiveFilters && (
              <div className="flex justify-end mt-3 pt-3 border-t border-gray-100 dark:border-strokedark">
                <Button type="button" variant="ghost" size="sm" onClick={() => {
                  setSearchTerm(""); setStatusFilter("all"); setStartDate(null); setEndDate(null); setCurrentPage(1)
                }}>
                  Effacer filtres
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4 sm:mb-6">
          <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-body dark:text-bodydark2 mb-1">Total</p>
              <p className="text-xl font-bold">{stats?.total_transactions ?? totalCount}</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-meta-3" />
                <p className="text-xs font-medium text-body dark:text-bodydark2">Succès</p>
              </div>
              <p className="text-xl font-bold">{stats?.completed_transactions ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-yellow-500" />
                <p className="text-xs font-medium text-body dark:text-bodydark2">En cours</p>
              </div>
              <p className="text-xl font-bold">{stats?.pending_transactions ?? 0}</p>
            </CardContent>
          </Card>
          <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <p className="text-xs font-medium text-body dark:text-bodydark2">Échecs</p>
              </div>
              <p className="text-xl font-bold">{stats?.failed_transactions ?? 0}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <CardHeader className="border-b border-gray-100 dark:border-strokedark">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-meta-2 dark:bg-orange-900 rounded-lg">
                <Zap className="h-5 w-5 text-primary dark:text-secondary" />
              </div>
              <span>Liste des recharges auto</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-body dark:text-bodydark">Chargement des recharges...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-4 text-center">
                <ErrorDisplay error={error} onRetry={fetchTransactions} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-gray-100 dark:bg-meta-4 flex items-center justify-center">
                  <Zap className="h-8 w-8 text-bodydark2" />
                </div>
                <p className="text-body dark:text-bodydark">
                  {debouncedSearch ? `Aucune recharge ne correspond à « ${debouncedSearch} »` : "Aucune recharge automatique pour le moment."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-boxdark-2/50">
                      <TableHead>Référence</TableHead>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Réseau</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.uid} className="hover:bg-gray-50 dark:hover:bg-boxdark-2/50">
                        <TableCell>
                          <div className="flex items-center gap-2 font-mono text-sm">
                            <span className="truncate max-w-[140px]">{tx.reference || tx.uid}</span>
                            <CopyButton value={tx.reference || tx.uid} className="h-3.5 w-3.5" iconClassName="h-3 w-3" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-bodydark2" />
                            <span className="font-medium">{tx.user_display_name || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-bodydark2" />
                            <span>{tx.phone_number || "—"}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{tx.network?.nom || "—"}</div>
                            <div className="text-xs text-bodydark2">{tx.aggregator?.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 font-medium">
                            <DollarSign className="h-4 w-4 text-bodydark2" />
                            {tx.formatted_amount || `${formatAmount(tx.amount)} FCFA`}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(tx.status)}`}>
                            {tx.status_display || tx.status || "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-body dark:text-bodydark2">
                          {formatDate(tx.created_at)}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => { setDetailTx(tx); setDetailOpen(true) }}>
                            <Eye className="h-4 w-4 mr-1" /> Voir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-body dark:text-bodydark2">
              Page {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détail recharge auto</DialogTitle>
            </DialogHeader>
            {detailTx && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Référence</span><span className="font-mono">{detailTx.reference || detailTx.uid}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Utilisateur</span><span>{detailTx.user_display_name || "—"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Téléphone</span><span>{detailTx.phone_number || "—"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Réseau</span><span>{detailTx.network?.nom || "—"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Agrégateur</span><span>{detailTx.aggregator?.name || "—"}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Montant</span><span>{detailTx.formatted_amount || `${formatAmount(detailTx.amount)} FCFA`}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Frais</span><span>{detailTx.formatted_fees || `${formatAmount(detailTx.fees)} FCFA`}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Crédité</span><span>{formatAmount(detailTx.amount_credited)} FCFA</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Statut</span><span>{detailTx.status_display || detailTx.status}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Créée</span><span>{formatDate(detailTx.created_at)}</span></div>
                <div className="flex justify-between gap-3"><span className="text-bodydark2">Terminée</span><span>{formatDate(detailTx.completed_at)}</span></div>
                {detailTx.error_message && (
                  <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 text-red-700 dark:text-red-300">
                    {detailTx.error_message}
                  </div>
                )}
              </div>
            )}
            <DialogClose asChild>
              <Button variant="outline" className="mt-2">Fermer</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

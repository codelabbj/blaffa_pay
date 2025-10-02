"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/lib/useApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Users, Filter, CheckCircle, XCircle, Mail, Calendar, UserCheck, DollarSign, TrendingUp, Clock, ArrowUpDown as ArrowUpDownIcon, Plus, Eye, Edit, Trash2, ToggleLeft, ToggleRight, BarChart3, Shield, User, AlertTriangle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface BettingTransaction {
  uid: string;
  reference: string;
  partner_name: string;
  platform_name: string;
  transaction_type: "deposit" | "withdrawal";
  amount: string;
  status: string;
  commission_amount: string;
  commission_paid: boolean;
  created_at: string;
}

export default function BettingTransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [commissionFilter, setCommissionFilter] = useState("all")
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState<BettingTransaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortField, setSortField] = useState<"created_at" | "amount" | "status" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const { t } = useLanguage()
  const itemsPerPage = 20
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const apiFetch = useApi();
  const router = useRouter()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailTransaction, setDetailTransaction] = useState<any | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false)
  const [cancellationForm, setCancellationForm] = useState({ admin_notes: "" })
  const [cancellationLoading, setCancellationLoading] = useState(false)
  const [cancellationError, setCancellationError] = useState("")
  const [stats, setStats] = useState<any | null>(null)

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      setError("")
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
        })
        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm)
        }
        if (statusFilter !== "all") {
          params.append("status", statusFilter)
        }
        if (typeFilter !== "all") {
          params.append("transaction_type", typeFilter)
        }
        if (platformFilter !== "all") {
          params.append("platform", platformFilter)
        }
        if (commissionFilter !== "all") {
          params.append("commission_paid", commissionFilter === "paid" ? "true" : "false")
        }
        if (startDate) {
          params.append("created_at__gte", startDate)
        }
        if (endDate) {
          params.append("created_at__lt", endDate)
        }
        const orderingParam = sortField
          ? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
          : "&ordering=-created_at"
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/transactions/?${params.toString()}${orderingParam}`
        const data = await apiFetch(endpoint)
        setTransactions(data.results || [])
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
        toast({ title: "Succès", description: "Transactions de paris chargées avec succès" })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        setTransactions([])
        setTotalCount(0)
        setTotalPages(1)
        toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, typeFilter, platformFilter, commissionFilter, sortField, sortDirection, startDate, endDate, t, toast, apiFetch])

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams()
        if (startDate) params.append("date_from", startDate)
        if (endDate) params.append("date_to", endDate)
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/transactions/stats/?${params.toString()}`
        const data = await apiFetch(endpoint)
        setStats(data)
      } catch (err: any) {
        console.error("Failed to fetch stats:", err)
      }
    }
    fetchStats()
  }, [baseUrl, startDate, endDate, apiFetch])

  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "created_at" | "amount" | "status") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Fetch transaction details
  const handleOpenDetail = async (transaction: BettingTransaction) => {
    setDetailModalOpen(true)
    setDetailLoading(true)
    setDetailError("")
    setDetailTransaction(null)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/transactions/${transaction.uid}/`
      const data = await apiFetch(endpoint)
      setDetailTransaction(data)
      toast({ title: "Succès", description: "Détails de la transaction chargés" })
    } catch (err: any) {
      setDetailError(extractErrorMessages(err))
      toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
    } finally {
      setDetailLoading(false)
    }
  }

  // Process cancellation
  const handleProcessCancellation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!detailTransaction) return

    setCancellationLoading(true)
    setCancellationError("")
    try {
      const payload = {
        success: true,
        admin_notes: cancellationForm.admin_notes,
      }

      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/transactions/${detailTransaction.uid}/process_cancellation/`
      const data = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      toast({ 
        title: "Succès", 
        description: data.message || "Demande d'annulation traitée avec succès" 
      })
      
      setCancellationModalOpen(false)
      setCancellationForm({ admin_notes: "" })
      
      // Refresh transaction details
      const refreshEndpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/transactions/${detailTransaction.uid}/`
      const refreshData = await apiFetch(refreshEndpoint)
      setDetailTransaction(refreshData)
    } catch (err: any) {
      setCancellationError(extractErrorMessages(err))
      toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
    } finally {
      setCancellationLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; icon: any; text: string } } = {
      success: { color: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300", icon: CheckCircle, text: "Succès" },
      failed: { color: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300", icon: XCircle, text: "Échec" },
      pending: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300", icon: Clock, text: "En attente" },
      cancellation_requested: { color: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300", icon: AlertTriangle, text: "Annulation demandée" },
      cancelled: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300", icon: XCircle, text: "Annulé" },
    }
    
    const statusInfo = statusMap[status] || { color: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300", icon: Clock, text: status }
    const Icon = statusInfo.icon
    
    return (
      <Badge className={statusInfo.color}>
        <div className="flex items-center space-x-1">
          <Icon className="h-3 w-3" />
          <span>{statusInfo.text}</span>
        </div>
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    if (type === "deposit") {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Dépôt</span>
          </div>
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
          <div className="flex items-center space-x-1">
            <ArrowUpDownIcon className="h-3 w-3" />
            <span>Retrait</span>
          </div>
        </Badge>
      )
    }
  }

  // Calculate summary stats
  const successfulTransactions = transactions.filter(t => t.status === "success").length
  const totalVolume = transactions.reduce((sum, t) => sum + parseFloat(t.amount), 0)
  const totalCommissions = transactions.reduce((sum, t) => sum + parseFloat(t.commission_amount), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                Transactions de Paris
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gérer les transactions des plateformes de paris
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {totalCount} transactions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.total_transactions || totalCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions réussies</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.successful_transactions || successfulTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Volume total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {(stats?.total_volume || totalVolume).toFixed(2)} FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commissions totales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {(stats?.total_commissions || totalCommissions).toFixed(2)} FCFA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="failed">Échec</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="cancellation_requested">Annulation demandée</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Filtrer par type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="deposit">Dépôt</SelectItem>
                  <SelectItem value="withdrawal">Retrait</SelectItem>
                </SelectContent>
              </Select>

              {/* Commission Filter */}
              <Select value={commissionFilter} onValueChange={setCommissionFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Filtrer par commission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les commissions</SelectItem>
                  <SelectItem value="paid">Commission payée</SelectItem>
                  <SelectItem value="unpaid">Commission impayée</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range Filter */}
              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onClear={() => {
                  setStartDate(null)
                  setEndDate(null)
                }}
                placeholder="Filtrer par date"
                className="col-span-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <BarChart3 className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <span>Liste des transactions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Chargement des transactions...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <ErrorDisplay error={error} onRetry={() => {/* retry function */}} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                      <TableHead className="font-semibold">Référence</TableHead>
                      <TableHead className="font-semibold">Partenaire</TableHead>
                      <TableHead className="font-semibold">Plateforme</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Montant</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Commission</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Copy className="h-4 w-4 text-gray-400" />
                            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                              {transaction.reference}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {transaction.partner_name?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {transaction.partner_name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {transaction.platform_name?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                {transaction.platform_name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getTypeBadge(transaction.transaction_type)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {parseFloat(transaction.amount).toFixed(2)} FCFA
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {parseFloat(transaction.commission_amount).toFixed(2)} FCFA
                            </span>
                            <Badge className={transaction.commission_paid ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"}>
                              {transaction.commission_paid ? "Payée" : "Impayée"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {transaction.created_at 
                                ? new Date(transaction.created_at).toLocaleDateString()
                                : 'Inconnu'
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/betting-transactions/${transaction.uid}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Détails
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, totalCount)} sur {totalCount} résultats
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-orange-500 text-white" : ""}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && transactions.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
            <CardContent className="p-12 text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucune transaction trouvée
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? `Aucune transaction ne correspond à "${searchTerm}"` : "Aucune transaction de paris n'a encore été effectuée."}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-orange-600" />
                <span>Détails de la transaction</span>
              </DialogTitle>
            </DialogHeader>
            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : detailError ? (
              <ErrorDisplay error={detailError} />
            ) : detailTransaction ? (
              <div className="space-y-6">
                {/* Transaction Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Partenaire
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom:</span>
                          <p className="text-lg font-semibold text-blue-600">
                            {detailTransaction.partner_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ID:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.partner}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-3 flex items-center">
                        <BarChart3 className="h-5 w-5 mr-2" />
                        Plateforme
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom:</span>
                          <p className="text-lg font-semibold text-orange-600">
                            {detailTransaction.platform_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ID:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.platform}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-green-800 dark:text-green-300 mb-3 flex items-center">
                        <DollarSign className="h-5 w-5 mr-2" />
                        Transaction
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Montant:</span>
                          <p className="text-lg font-semibold text-green-600">
                            {parseFloat(detailTransaction.amount).toFixed(2)} FCFA
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.transaction_type}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Transaction Details */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Copy className="h-5 w-5 text-gray-600" />
                      <span>Détails de la transaction</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Référence:</span>
                          <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                            {detailTransaction.reference}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut:</span>
                          <div className="mt-1">
                            {getStatusBadge(detailTransaction.status)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ID Utilisateur Betting:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.betting_user_id || 'Non disponible'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Code de retrait:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.withdrawal_code || 'Non disponible'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ID Transaction Externe:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.external_transaction_id || 'Non disponible'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de commission:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.commission_rate}%
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Montant de commission:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {parseFloat(detailTransaction.commission_amount).toFixed(2)} FCFA
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission payée:</span>
                          <div className="mt-1">
                            <Badge className={detailTransaction.commission_paid ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"}>
                              {detailTransaction.commission_paid ? "Payée" : "Impayée"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* External Response */}
                {detailTransaction.external_response && (
                  <Card className="bg-gray-50 dark:bg-gray-700 border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <RefreshCw className="h-5 w-5 text-gray-600" />
                        <span>Réponse Externe</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                        {JSON.stringify(detailTransaction.external_response, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Cancellation Actions */}
                {detailTransaction.status === "cancellation_requested" && (
                  <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <span>Demande d'annulation</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Demandée par:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.cancellation_requested_by_name}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Date de demande:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.cancellation_requested_at 
                              ? new Date(detailTransaction.cancellation_requested_at).toLocaleString()
                              : 'Non disponible'
                            }
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Notes:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailTransaction.notes || 'Aucune note'}
                          </p>
                        </div>
                        <div className="pt-4">
                          <Button
                            onClick={() => setCancellationModalOpen(true)}
                            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                          >
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Traiter l'annulation
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Créé le:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {detailTransaction.created_at 
                        ? new Date(detailTransaction.created_at).toLocaleString()
                        : 'Non disponible'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis à jour le:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {detailTransaction.updated_at 
                        ? new Date(detailTransaction.updated_at).toLocaleString()
                        : 'Non disponible'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Solde partenaire avant:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {parseFloat(detailTransaction.partner_balance_before || 0).toFixed(2)} FCFA
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Cancellation Modal */}
        <Dialog open={cancellationModalOpen} onOpenChange={setCancellationModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Traiter la demande d'annulation</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleProcessCancellation} className="space-y-6">
              {cancellationError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <ErrorDisplay error={cancellationError} />
                </div>
              )}

              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="font-medium text-orange-800 dark:text-orange-300 mb-2">
                  Transaction: {detailTransaction?.reference}
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  Cette action va approuver la demande d'annulation et rembourser le partenaire.
                </p>
              </div>

              <div>
                <Label htmlFor="admin_notes">Notes Administrateur</Label>
                <Textarea
                  id="admin_notes"
                  placeholder="Ajouter des notes pour cette annulation..."
                  value={cancellationForm.admin_notes}
                  onChange={(e) => setCancellationForm(prev => ({ ...prev, admin_notes: e.target.value }))}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={cancellationLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {cancellationLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Traitement...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Approuver l'annulation
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCancellationModalOpen(false)}
                  disabled={cancellationLoading}
                >
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

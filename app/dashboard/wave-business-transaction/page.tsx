"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/lib/useApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Eye, DollarSign, Phone, Calendar, Clock, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { DateRangeFilter } from "@/components/ui/date-range-filter"

// Colors for consistent theming - using logo colors
const COLORS = {
  primary: '#FF6B35', // Orange (primary from logo)
  secondary: '#00FF88', // Bright green from logo
  accent: '#1E3A8A', // Dark blue from logo
  danger: '#EF4444',
  warning: '#F97316',
  success: '#00FF88', // Using bright green for success
  info: '#1E3A8A', // Using dark blue for info
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
};

interface WaveBusinessTransaction {
  uid: string
  amount: string
  amount_as_integer: number
  recipient_phone: string
  status: "pending" | "confirmed" | "cancelled" | "expired"
  reference: string
  created_by: number
  fcm_notifications: any[]
  callback_url: string
  confirmed_at: string | null
  expires_at: string
  is_expired: boolean
  created_at: string
  updated_at: string
}

interface ApiResponse {
  count: number
  next: string | null
  previous: string | null
  results: WaveBusinessTransaction[]
}

export default function WaveBusinessPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [phoneFilter, setPhoneFilter] = useState("")
  const [includeExpired, setIncludeExpired] = useState(false)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [transactions, setTransactions] = useState<WaveBusinessTransaction[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortField, setSortField] = useState<"amount" | "recipient_phone" | "created_at" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const apiFetch = useApi()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailTransaction, setDetailTransaction] = useState<WaveBusinessTransaction | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const itemsPerPage = 20

  // Récupérer les transactions depuis l'API
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
          params.append("reference", searchTerm)
        }
        if (statusFilter !== "all") {
          params.append("status", statusFilter)
        }
        if (phoneFilter.trim() !== "") {
          params.append("phone", phoneFilter)
        }
        if (includeExpired) {
          params.append("include_expired", "true")
        }
        if (startDate) {
          params.append("created_at__gte", startDate)
        }
        if (endDate) {
          params.append("created_at__lte", endDate)
        }

        const orderingParam = sortField
          ? `&ordering=${(sortDirection === "asc" ? "" : "-")}${sortField}`
          : ""

        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/wave-business-transactions/?${params.toString()}${orderingParam}`
        const data: ApiResponse = await apiFetch(endpoint)

        setTransactions(data.results || [])
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))

        toast({
          title: "Succès",
          description: "Transactions Wave Business chargées avec succès"
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        setTransactions([])
        setTotalCount(0)
        setTotalPages(1)
        toast({
          title: "Erreur de chargement",
          description: errorMessage,
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, phoneFilter, includeExpired, sortField, sortDirection, startDate, endDate, toast, apiFetch])

  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "amount" | "recipient_phone" | "created_at") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getStatusBadge = (status: string, isExpired: boolean) => {
    if (isExpired) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Expiré
        </Badge>
      )
    }

    switch (status) {
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        )
      case "confirmed":
        return (
          <Badge className="bg-green-100 text-green-500 dark:bg-green-900/20 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmé
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
            <XCircle className="h-3 w-3 mr-1" />
            Annulé
          </Badge>
        )
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
            {status}
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatAmount = (amount: string) => {
    return `${parseFloat(amount).toLocaleString("fr-FR")} FCFA`
  }

  // Ouvrir les détails d'une transaction
  const handleOpenDetail = (transaction: WaveBusinessTransaction) => {
    setDetailModalOpen(true)
    setDetailTransaction(transaction)
    setDetailError("")
    toast({
      title: "Détail chargé",
      description: "Détails de la transaction affichés avec succès"
    })
  }

  const handleCloseDetail = () => {
    setDetailModalOpen(false)
    setDetailTransaction(null)
    setDetailError("")
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: `${label} copié !` })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                Transactions Wave Business
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gérer et surveiller les transactions Wave Business
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {totalCount} transactions
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher par référence..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>

              {/* Phone Filter */}
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Filtrer par téléphone..."
                  value={phoneFilter}
                  onChange={(e) => setPhoneFilter(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="confirmed">Confirmé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                </SelectContent>
              </Select>

              {/* Include Expired Switch */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <Switch
                  id="include-expired"
                  checked={includeExpired}
                  onCheckedChange={setIncludeExpired}
                />
                <label htmlFor="include-expired" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Inclure les expirés
                </label>
              </div>

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
                className="col-span-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <DollarSign className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <span>Liste des Transactions</span>
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
                <ErrorDisplay
                  error={error}
                  onRetry={() => {
                    setCurrentPage(1)
                    setError("")
                  }}
                  variant="full"
                  showDismiss={false}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                      <TableHead className="font-semibold">Référence</TableHead>
                      <TableHead className="font-semibold">
                        <Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
                          Montant
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold">
                        <Button variant="ghost" onClick={() => handleSort("recipient_phone")} className="h-auto p-0 font-semibold">
                          Téléphone destinataire
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">
                        <Button variant="ghost" onClick={() => handleSort("created_at")} className="h-auto p-0 font-semibold">
                          Date de création
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="font-semibold">Date d'expiration</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell className="font-mono text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {transaction.reference.charAt(0).toUpperCase()}
                            </div>
                            <span>{transaction.reference}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {/* <DollarSign className="h-4 w-4 text-green-600" /> */}
                            <span>{formatAmount(transaction.amount)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-blue-600" />
                            <span>{transaction.recipient_phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(transaction.status, transaction.is_expired)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {new Date(transaction.created_at).toLocaleDateString()}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(transaction.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-orange-600" />
                            <span>{formatDate(transaction.expires_at)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenDetail(transaction)}
                            className="border-gray-200 dark:border-gray-600"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Détails
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Résultats affichés : {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalCount)} sur {totalCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="border-gray-200 dark:border-gray-600"
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
                      className={currentPage === page ? "bg-orange-500 text-white" : "border-gray-200 dark:border-gray-600"}
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
                className="border-gray-200 dark:border-gray-600"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Modal des détails de la transaction */}
        <Dialog open={detailModalOpen} onOpenChange={(open) => { if (!open) handleCloseDetail() }}>
          <DialogContent className="bg-white dark:bg-gray-800 border-0 shadow-xl max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Eye className="h-5 w-5 text-orange-600" />
                </div>
                <span>Détails de la transaction</span>
              </DialogTitle>
            </DialogHeader>
            {detailLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Chargement des détails...</span>
                </div>
              </div>
            ) : detailError ? (
              <ErrorDisplay
                error={detailError}
                variant="inline"
                showRetry={false}
                className="mb-4"
              />
            ) : detailTransaction ? (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <DollarSign className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">UID</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium">{detailTransaction.uid}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(detailTransaction.uid, "UID")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <DollarSign className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Référence</div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm font-medium">{detailTransaction.reference}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(detailTransaction.reference, "Référence")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <DollarSign className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Montant</div>
                      <div className="font-medium">{formatAmount(detailTransaction.amount)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                      <Phone className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Téléphone</div>
                      <div className="font-medium">{detailTransaction.recipient_phone}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Calendar className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Créé le</div>
                      <div className="font-medium">{formatDate(detailTransaction.created_at)}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <Clock className="h-4 w-4 text-red-600" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Expire le</div>
                      <div className="font-medium">{formatDate(detailTransaction.expires_at)}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm font-medium">Statut</span>
                    {getStatusBadge(detailTransaction.status, detailTransaction.is_expired)}
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm font-medium">Créé par</span>
                    <span className="text-sm">{detailTransaction.created_by}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="text-sm font-medium">Notifications FCM</span>
                    <span className="text-sm">{detailTransaction.fcm_notifications.length} notification(s)</span>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <div className="text-sm font-medium mb-2">URL de callback</div>
                    <div className="text-sm break-all text-gray-600 dark:text-gray-400">{detailTransaction.callback_url}</div>
                  </div>
                </div>
              </div>
            ) : null}
            <DialogClose asChild>
              <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white">
                Fermer
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Pencil, Trash, CreditCard, TrendingUp, DollarSign, Clock, CheckCircle, XCircle, AlertCircle, Plus, Filter, MoreHorizontal, Eye, TrendingDown } from "lucide-react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
// import { useWebSocket } from "@/components/providers/websocket-provider"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DateRangeFilter } from "@/components/ui/date-range-filter"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

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

export default function TransactionsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"amount" | "date" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [transactions, setTransactions] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { t } = useLanguage()
  const itemsPerPage = 10
  const apiFetch = useApi()
  const { toast } = useToast()
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")
  const [editTransaction, setEditTransaction] = useState<any | null>(null)
  const [deleteUid, setDeleteUid] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const router = useRouter()
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [pendingEditPayload, setPendingEditPayload] = useState<any | null>(null)

  // Edit form state
  const [editForm, setEditForm] = useState({
    status: "",
    external_transaction_id: "",
    balance_before: "",
    balance_after: "",
    fees: "",
    confirmation_message: "",
    raw_sms: "",
    completed_at: "",
    error_message: "",
  })

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setLoading(true)
    setError("")
    try {
      let endpoint = "";
      if (searchTerm.trim() !== "" || statusFilter !== "all" || typeFilter !== "all" || sortField || startDate || endDate) {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
        });
        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm);
        }
        if (statusFilter !== "all") {
          params.append("status", statusFilter);
        }
        if (typeFilter !== "all") {
          params.append("type", typeFilter);
        }
        if (sortField) {
          params.append("ordering", `${sortDirection === "asc" ? "+" : "-"}${sortField}`);
        }
        if (startDate) {
          params.append("created_at__gte", startDate);
        }
        if (endDate) {
          params.append("created_at__lte", endDate);
        }
        endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/transactions/?${params.toString()}`;
      } else {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
        });
        endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/transactions/?${params.toString()}`;
      }
      console.log("Transaction API endpoint:", endpoint);
      const data = await apiFetch(endpoint);
      setTransactions(data.results || []);
      setTotalCount(data.count || 0);
      toast({
        title: t("transactions.success"),
        description: t("transactions.loadedSuccessfully"),
      });
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.failedToLoad");
      setError(errorMessage);
      setTransactions([]);
      toast({
        title: t("transactions.failedToLoad"),
        description: errorMessage,
        variant: "destructive",
      });
      console.error('Transactions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [searchTerm, statusFilter, typeFilter, currentPage, sortField, sortDirection, startDate, endDate]);

  // Remove client-side filtering and sorting since it's now handled by the API
  const filteredAndSortedTransactions = transactions
  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredAndSortedTransactions

  const handleSort = (field: "amount" | "date") => {
    setCurrentPage(1)
    // Toggle direction if clicking the same field, else reset to desc
    setSortDirection((prevDir) => (sortField === field ? (prevDir === "desc" ? "asc" : "desc") : "desc"))
    setSortField(field)
  }

  
    const statusMap: Record<string, { label: string; color: string }> = {
      pending:      { label: "En attente", color: "#ffc107" },      // jaune
      sent_to_user: { label: "Envoyé", color: "#17a2b8" },          // bleu clair
      processing:   { label: "En cours", color: "#fd7e14" },        // orange
      completed:    { label: "Terminé", color: "#28a745" },         // vert foncé
      success:      { label: "Succès", color: "#20c997" },          // turquoise
      failed:       { label: "Échec", color: "#dc3545" },           // rouge
      cancelled:    { label: "Annulé", color: "#6c757d" },          // gris
      timeout:      { label: "Expiré", color: "#6f42c1" },          // violet
    };

    const getStatusBadge = (status: string) => {
      const info = statusMap[status] || { label: status, color: "#adb5bd" };
      return (
        <span
          style={{
            backgroundColor: info.color,
            color: "#fff",
            borderRadius: "0.375rem",
            padding: "0.25em 0.75em",
            fontWeight: 500,
            fontSize: "0.875rem",
            display: "inline-block",
          }}
        >
          {info.label}
        </span>
      );
    };
   

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      deposit: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      withdrawal: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      transfer: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
    }
    return <Badge className={colors[type] || ""}>{t(`transactions.${type}`) || type}</Badge>
  }

  // Open edit modal and populate form
  const handleOpenEdit = (transaction: any) => {
    setEditTransaction(transaction)
    setEditForm({
      status: transaction.status || "",
      external_transaction_id: transaction.external_transaction_id || "",
      balance_before: transaction.balance_before || "",
      balance_after: transaction.balance_after || "",
      fees: transaction.fees || "",
      confirmation_message: transaction.confirmation_message || "",
      raw_sms: transaction.raw_sms || "",
      completed_at: transaction.completed_at || "",
      error_message: transaction.error_message || "",
    })
    setEditModalOpen(true)
    setEditError("")
  }
  // Handle edit form change
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }
  // Submit edit -> open confirm modal
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTransaction) return
    const payload = { ...editForm }
    setPendingEditPayload(payload)
    setShowEditConfirm(true)
  }

  // Confirm and send PATCH
  const confirmEditAndSend = async () => {
    if (!editTransaction || !pendingEditPayload) return
    setEditLoading(true)
    setEditError("")
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${editTransaction.uid}/`
      await apiFetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingEditPayload),
      })
      toast({ title: t("transactions.editSuccess"), description: t("transactions.transactionUpdatedSuccessfully") })
      setShowEditConfirm(false)
      setPendingEditPayload(null)
      setEditModalOpen(false)
      setEditTransaction(null)
      setEditForm({
        status: "",
        external_transaction_id: "",
        balance_before: "",
        balance_after: "",
        fees: "",
        confirmation_message: "",
        raw_sms: "",
        completed_at: "",
        error_message: "",
      })
      setCurrentPage(1)
      router.refresh()
      await fetchTransactions()
    } catch (err: any) {
      const backendError = extractErrorMessages(err) || t("transactions.failedToEdit")
      setEditError(backendError)
      toast({ title: t("transactions.failedToEdit"), description: backendError, variant: "destructive" })
    } finally {
      setEditLoading(false)
    }
  }
  // Delete transaction
  const handleDelete = async () => {
    if (!deleteUid) return
    setLoading(true)
    setError("")
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${deleteUid}/`
      await apiFetch(endpoint, { method: "DELETE" })
      toast({
        title: t("transactions.deleteSuccess"),
        description: t("transactions.transactionDeletedSuccessfully"),
      })
      setDeleteUid(null)
      // Refetch transactions
      setCurrentPage(1)
    } catch (err: any) {
      const backendError = err?.message || t("transactions.failedToDelete")
      setError(backendError)
      toast({
        title: t("transactions.failedToDelete"),
        description: backendError,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // WEBSOCKET CODE COMMENTED OUT
  // Listen for transaction_update WebSocket messages
  // const { lastMessage } = useWebSocket();
  // useEffect(() => {
  //   if (!lastMessage) return;
  //   try {
  //     const data = typeof lastMessage.data === "string" ? JSON.parse(lastMessage.data) : lastMessage.data;

  //     // Handle new transaction creation (per backend docs)
  //     if (data.type === "new_transaction" && data.event === "transaction_created" && data.transaction_data) {
  //       const newTx = data.transaction_data;
  //       // If user is on page 1, show it immediately on top; otherwise, just bump count
  //       setTransactions(prev => (currentPage === 1 ? [newTx, ...prev].slice(0, itemsPerPage) : prev));
  //       setTotalCount(prev => prev + 1);
  //       toast({
  //         title: t("transactions.created") || "Transaction created",
  //         description: data.message || `${t("transactions.transaction")} ${newTx.uid} ${t("transactions.createdSuccessfully") || "was created."}`,
  //       });
  //       return;
  //     }

  //     // Handle live transaction updates (existing behavior)
  //     if (data.type === "transaction_update" && data.transaction_uid) {
  //       setTransactions((prev) =>
  //         prev.map((tx) =>
  //           tx.uid === data.transaction_uid
  //             ? { ...tx, status: data.status, ...data.data }
  //             : tx
  //         )
  //       );
  //       toast({
  //         title: t("transactions.liveUpdate"),
  //         description: `${t("transactions.transaction")} ${data.transaction_uid} ${t("transactions.statusUpdated")}: ${data.status}`,
  //       });
  //       return;
  //     }

  //     // Optionally surface system events as informational toasts
  //     if (data.type === "system_event" && data.event === "system_event_created") {
  //       toast({
  //         title: t("transactions.systemEvent") || "System event",
  //         description: data.message || data?.event_data?.description || "",
  //       });
  //       return;
  //     }
  //   } catch (err) {
  //     // Optionally log or handle parse errors
  //   }
  // }, [lastMessage, t, toast, currentPage, itemsPerPage]);

  // Retry modal state
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [retryReason, setRetryReason] = useState("")
  const [retryLoading, setRetryLoading] = useState(false)
  const [retryError, setRetryError] = useState("")
  const [retryTransaction, setRetryTransaction] = useState<any | null>(null)

  // Cancel modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelError, setCancelError] = useState("")
  const [cancelTransaction, setCancelTransaction] = useState<any | null>(null)

  // Mark as success modal state
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [successReason, setSuccessReason] = useState("")
  const [successLoading, setSuccessLoading] = useState(false)
  const [successError, setSuccessError] = useState("")
  const [successTransaction, setSuccessTransaction] = useState<any | null>(null)

  // Mark as failed modal state
  const [failedModalOpen, setFailedModalOpen] = useState(false)
  const [failedReason, setFailedReason] = useState("Tentative de relance après timeout")
  const [failedLoading, setFailedLoading] = useState(false)
  const [failedError, setFailedError] = useState("")
  const [failedTransaction, setFailedTransaction] = useState<any | null>(null)

  // Extract a user uid from transaction, trying several likely fields
  const extractUserUid = (tx: any): string | null => {
    return tx?.user_uid || tx?.user_id || tx?.user?.uid || tx?.owner_uid || null
  }

  // Assign transaction to its user
  const handleAssign = async (tx: any) => {
    const userUid = extractUserUid(tx)
    if (!userUid) {
      toast({
        title: t("transactions.assignFailed") || "Assign failed",
        description: t("transactions.userIdMissing") || "User ID not found on this transaction.",
        variant: "destructive",
      })
      return
    }
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${tx.uid}/assign/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_uid: userUid }),
      })
      toast({
        title: t("transactions.assignSuccess") || "Assigned",
        description: t("transactions.assignedSuccessfully") || "Transaction assigned successfully.",
      })
      // Refresh list
      setCurrentPage(1)
      router.refresh()
      await fetchTransactions()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.assignFailed") || "Failed to assign transaction"
      toast({ title: t("transactions.assignFailed") || "Assign failed", description: errorMessage, variant: "destructive" })
    }
  }

  // Open retry modal
  const openRetryModal = (tx: any) => {
    setRetryTransaction(tx)
    setRetryReason("")
    setRetryError("")
    setRetryModalOpen(true)
  }

  // Submit retry request
  const handleRetrySubmit = async () => {
    if (!retryTransaction) return
    if (!retryReason.trim()) {
      setRetryError(t("transactions.retryReasonRequired") || "Reason is required")
      return
    }
    setRetryLoading(true)
    setRetryError("")
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${retryTransaction.uid}/retry/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: retryReason.trim() }),
      })
      toast({
        title: t("transactions.retryQueued") || "Retry queued",
        description: t("transactions.retryRequested") || "Retry request sent successfully.",
      })
      setRetryModalOpen(false)
      setRetryTransaction(null)
      setRetryReason("")
      // Refresh list
      setCurrentPage(1)
      router.refresh()
      await fetchTransactions()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.retryFailed") || "Failed to retry transaction"
      setRetryError(errorMessage)
      toast({ title: t("transactions.retryFailed") || "Retry failed", description: errorMessage, variant: "destructive" })
    } finally {
      setRetryLoading(false)
    }
  }

  // Open/submit cancel
  const openCancelModal = (tx: any) => {
    setCancelTransaction(tx)
    setCancelReason("")
    setCancelError("")
    setCancelModalOpen(true)
  }
  const handleCancelSubmit = async () => {
    if (!cancelTransaction) return
    if (!cancelReason.trim()) {
      setCancelError(t("transactions.cancelReasonRequired") || "Reason is required")
      return
    }
    setCancelLoading(true)
    setCancelError("")
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${cancelTransaction.uid}/cancel/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason.trim() }),
      })
      toast({
        title: t("transactions.cancelQueued") || "Cancel queued",
        description: t("transactions.cancelRequested") || "Cancel request sent successfully.",
      })
      setCancelModalOpen(false)
      setCancelTransaction(null)
      setCancelReason("")
      setCurrentPage(1)
      router.refresh()
      await fetchTransactions()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.cancelFailed") || "Failed to cancel transaction"
      setCancelError(errorMessage)
      toast({ title: t("transactions.cancelFailed") || "Cancel failed", description: errorMessage, variant: "destructive" })
    } finally {
      setCancelLoading(false)
    }
  }

  // Open/submit success
  const openSuccessModal = (tx: any) => {
    setSuccessTransaction(tx)
    setSuccessReason("")
    setSuccessError("")
    setSuccessModalOpen(true)
  }
  const handleSuccessSubmit = async () => {
    if (!successTransaction) return
    if (!successReason.trim()) {
      setSuccessError(t("transactions.successReasonRequired") || "Reason is required")
      return
    }
    setSuccessLoading(true)
    setSuccessError("")
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${successTransaction.uid}/success/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: successReason.trim() }),
      })
      toast({
        title: t("transactions.successQueued") || "Success queued",
        description: t("transactions.successRequested") || "Success update sent successfully.",
      })
      setSuccessModalOpen(false)
      setSuccessTransaction(null)
      setSuccessReason("")
      setCurrentPage(1)
      router.refresh()
      await fetchTransactions()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.successFailed") || "Failed to mark transaction as success"
      setSuccessError(errorMessage)
      toast({ title: t("transactions.successFailed") || "Mark as success failed", description: errorMessage, variant: "destructive" })
    } finally {
      setSuccessLoading(false)
    }
  }

  // Open/submit failed
  const openFailedModal = (tx: any) => {
    setFailedTransaction(tx)
    setFailedReason("Tentative de relance après timeout")
    setFailedError("")
    setFailedModalOpen(true)
  }
  const handleFailedSubmit = async () => {
    if (!failedTransaction) return
    if (!failedReason.trim()) {
      setFailedError(t("transactions.failedReasonRequired") || "Reason is required")
      return
    }
    setFailedLoading(true)
    setFailedError("")
    try {
      const endpoint = `${baseUrl}api/payments/transactions/${failedTransaction.uid}/mark-failed/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: failedReason.trim() }),
      })
      toast({
        title: t("transactions.failedQueued") || "Mark as failed queued",
        description: t("transactions.failedRequested") || "Mark as failed request sent successfully.",
      })
      setFailedModalOpen(false)
      setFailedTransaction(null)
      setFailedReason("Tentative de relance après timeout")
      setCurrentPage(1)
      router.refresh()
      await fetchTransactions()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("transactions.failedFailed") || "Failed to mark transaction as failed"
      setFailedError(errorMessage)
      toast({ title: t("transactions.failedFailed") || "Mark as failed failed", description: errorMessage, variant: "destructive" })
    } finally {
      setFailedLoading(false)
    }
  }

  if (false && loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("common.loading")}</span>
      </div>
    )
  }

  if (false && error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchTransactions}
        variant="full"
        showDismiss={false}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                {t("transactions.title")}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Surveiller et gérer les transactions de paiement
              </p>
      </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {totalCount} transactions
                  </span>
                </div>
              </div>
            {/* <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Transaction
            </Button> */}
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
                  placeholder={t("transactions.searchPlaceholder")}
                value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              />
            </div>

              {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder={t("transactions.filterByStatus")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.allStatuses")}</SelectItem>
                <SelectItem value="completed">{t("transactions.completed")}</SelectItem>
                <SelectItem value="pending">{t("transactions.pending")}</SelectItem>
                <SelectItem value="failed">{t("transactions.failed")}</SelectItem>
                  <SelectItem value="processing">{t("transactions.processing")}</SelectItem>
              </SelectContent>
            </Select>

              {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder={t("transactions.filterByType")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("transactions.allTypes")}</SelectItem>
                <SelectItem value="deposit">{t("transactions.deposit")}</SelectItem>
                <SelectItem value="withdrawal">{t("transactions.withdrawal")}</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select 
                value={sortField || ""} 
                onValueChange={(value) => setSortField(value as "amount" | "date" | null)}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amount">Montant</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
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
              className="col-span-1"
            />
          </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CreditCard className="h-5 w-5 text-green-600 dark:text-green-300" />
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
                <ErrorDisplay error={error} onRetry={fetchTransactions} />
              </div>
            ) : (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-gray-900/50">
                      <TableHead className="font-semibold">ID Transaction</TableHead>
                      <TableHead className="font-semibold">Destinataire</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Montant</TableHead>
                      <TableHead className="font-semibold">Réseau</TableHead>
                      <TableHead className="font-semibold">Créé par</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell>
                          <div className="font-mono text-sm text-gray-900 dark:text-gray-100">
                            {transaction.uid}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {transaction.recipient_name?.charAt(0)?.toUpperCase() || transaction.user?.email?.charAt(0)?.toUpperCase() }
                            </div> */}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {transaction.recipient_phone || 'Utilisateur inconnu'}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {transaction.recipient_name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              transaction.type === 'deposit'
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                            }
                          >
                            {transaction.type === 'deposit' ? 'Dépôt' : 'Retrait'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                            {parseFloat(transaction.amount || 0).toFixed(2)} FCFA
                          </div>
                          {transaction.fees && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Frais: ${parseFloat(transaction.fees).toFixed(2)}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-900 dark:text-gray-100">
                            {transaction.network_name || transaction.network || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                              {transaction.recipient_name?.charAt(0)?.toUpperCase() || transaction.user?.email?.charAt(0)?.toUpperCase() }
                            </div> */}
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {transaction.created_by_name}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {transaction.created_by_email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              transaction.status === 'success'
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : transaction.status === 'sent_to_user'
                                ? "bg-yellow-100 text-yellow-400 dark:bg-yellow-900/20 dark:text-yellow-300"
                                : transaction.status === 'failed'
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                            }
                          >
                            <div className="flex items-center space-x-1">
                              {transaction.status === 'success' && <CheckCircle className="h-3 w-3" />}
                              {transaction.status === 'pending' && <Clock className="h-3 w-3" />}
                              {transaction.status === 'failed' && <XCircle className="h-3 w-3" />}
                              {transaction.status === 'processing' && <AlertCircle className="h-3 w-3" />}
                              <span>{transaction.status}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(transaction.created_at).toLocaleTimeString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => router.push(`/dashboard/transactions/${transaction.uid}/edit`)}>
                                <Pencil className="h-4 w-4 mr-2" />
                               Modifier
                              </DropdownMenuItem>
                              {/* <DropdownMenuItem onClick={() => handleOpenEdit(transaction)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem> */}
                              {/* <DropdownMenuItem 
                                onClick={() => setDeleteUid(transaction.uid)}
                                className="text-red-600 dark:text-red-400"
                              >
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem> */}
                              <DropdownMenuItem onClick={() => openRetryModal(transaction)} className="text-orange-600 dark:text-orange-400">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                Relancer
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openCancelModal(transaction)} className="text-red-600 dark:text-red-400">
                                <XCircle className="h-4 w-4 mr-2" />
                                Annuler
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openSuccessModal(transaction)} className="text-green-600 dark:text-green-400">
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marquer comme Succès
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openFailedModal(transaction)} className="text-red-600 dark:text-red-400">
                                <XCircle className="h-4 w-4 mr-2" />
                                Marquer comme Échec
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

          {/* Pagination */}
        {Math.ceil(totalCount / itemsPerPage) > 1 && (
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, totalCount)} sur {totalCount} résultats
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
                {Array.from({ length: Math.min(5, Math.ceil(totalCount / itemsPerPage)) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-blue-600 text-white" : ""}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(Math.ceil(totalCount / itemsPerPage), currentPage + 1))}
                disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Modifier la transaction</DialogTitle>
              <DialogDescription>
                Mettre à jour les détails de la transaction
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Statut</label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner le statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="processing">En cours</SelectItem>
                      <SelectItem value="completed">Terminé</SelectItem>
                      <SelectItem value="failed">Échec</SelectItem>
                      <SelectItem value="cancelled">Annulé</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">ID Transaction externe</label>
                  <Input
                    name="external_transaction_id"
                    value={editForm.external_transaction_id}
                    onChange={handleEditChange}
                    placeholder="ID de transaction externe"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Solde avant</label>
                  <Input
                    name="balance_before"
                    value={editForm.balance_before}
                    onChange={handleEditChange}
                    placeholder="Solde avant la transaction"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Solde après</label>
                  <Input
                    name="balance_after"
                    value={editForm.balance_after}
                    onChange={handleEditChange}
                    placeholder="Solde après la transaction"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Frais</label>
                  <Input
                    name="fees"
                    value={editForm.fees}
                    onChange={handleEditChange}
                    placeholder="Frais de transaction"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Terminé le</label>
                  <Input
                    name="completed_at"
                    value={editForm.completed_at}
                    onChange={handleEditChange}
                    placeholder="Date de fin"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Message de confirmation</label>
                <textarea
                  name="confirmation_message"
                  value={editForm.confirmation_message}
                  onChange={handleEditChange}
                  placeholder="Message de confirmation"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">SMS brut</label>
                <textarea
                  name="raw_sms"
                  value={editForm.raw_sms}
                  onChange={handleEditChange}
                  placeholder="Contenu du SMS brut"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message d'erreur</label>
                <textarea
                  name="error_message"
                  value={editForm.error_message}
                  onChange={handleEditChange}
                  placeholder="Message d'erreur"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  disabled={editLoading}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {editLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Mise à jour...
                    </>
                  ) : (
                    "Mettre à jour la transaction"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Confirmation Modal */}
        <Dialog open={showEditConfirm} onOpenChange={setShowEditConfirm}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la mise à jour de la transaction</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir mettre à jour cette transaction ? Cette action ne peut pas être annulée.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                              <Button
                  variant="outline"
                  onClick={() => setShowEditConfirm(false)}
                  disabled={editLoading}
                >
                  Annuler
                </Button>
              <Button
                onClick={confirmEditAndSend}
                disabled={editLoading}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                {editLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Mise à jour...
                  </>
                ) : (
                  "Mettre à jour la transaction"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Retry Modal */}
        <Dialog open={retryModalOpen} onOpenChange={setRetryModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Relancer la transaction</DialogTitle>
              <DialogDescription>
                Fournir une raison pour relancer cette transaction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {retryError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{retryError}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="retry-reason" className="text-sm font-medium">
                  Raison *
                </label>
                <textarea
                  id="retry-reason"
                  value={retryReason}
                  onChange={(e) => setRetryReason(e.target.value)}
                  placeholder="Entrer la raison du relancement"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <DialogFooter>
                              <Button
                  variant="outline"
                  onClick={() => setRetryModalOpen(false)}
                  disabled={retryLoading}
                >
                  Annuler
                </Button>
              <Button
                onClick={handleRetrySubmit}
                disabled={retryLoading}
                className="bg-gradient-to-r from-orange-600 to-orange-600 hover:from-orange-700 hover:to-orange-700 text-white"
              >
                {retryLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Relancement...
                  </>
                ) : (
                  "Relancer la transaction"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Cancel Modal */}
        <Dialog open={cancelModalOpen} onOpenChange={setCancelModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annuler la transaction</DialogTitle>
              <DialogDescription>
                Fournir une raison pour annuler cette transaction
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {cancelError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{cancelError}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="cancel-reason" className="text-sm font-medium">
                  Raison *
                </label>
                <textarea
                  id="cancel-reason"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Entrer la raison de l'annulation"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <DialogFooter>
                              <Button
                  variant="outline"
                  onClick={() => setCancelModalOpen(false)}
                  disabled={cancelLoading}
                >
                  Annuler
                </Button>
              <Button
                onClick={handleCancelSubmit}
                disabled={cancelLoading}
                className="bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white"
              >
                {cancelLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Annulation...
                  </>
                ) : (
                  "Annuler la transaction"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marquer comme Succès</DialogTitle>
              <DialogDescription>
                Fournir une raison pour marquer cette transaction comme réussie
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {successError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{successError}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="success-reason" className="text-sm font-medium">
                  Raison *
                </label>
                <textarea
                  id="success-reason"
                  value={successReason}
                  onChange={(e) => setSuccessReason(e.target.value)}
                  placeholder="Entrer la raison du marquage comme succès"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <DialogFooter>
                              <Button
                  variant="outline"
                  onClick={() => setSuccessModalOpen(false)}
                  disabled={successLoading}
                >
                  Annuler
                </Button>
              <Button
                onClick={handleSuccessSubmit}
                disabled={successLoading}
                className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white"
              >
                {successLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Marquage...
                  </>
                ) : (
                  "Marquer comme Succès"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Failed Modal */}
        <Dialog open={failedModalOpen} onOpenChange={setFailedModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marquer comme Échec</DialogTitle>
              <DialogDescription>
                Fournir une raison pour marquer cette transaction comme échouée
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {failedError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{failedError}</p>
                </div>
              )}
              <div className="space-y-2">
                <label htmlFor="failed-reason" className="text-sm font-medium">
                  Raison *
                </label>
                <textarea
                  id="failed-reason"
                  value={failedReason}
                  onChange={(e) => setFailedReason(e.target.value)}
                  placeholder="Entrer la raison du marquage comme échec"
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <DialogFooter>
                              <Button
                  variant="outline"
                  onClick={() => setFailedModalOpen(false)}
                  disabled={failedLoading}
                >
                  Annuler
                </Button>
              <Button
                onClick={handleFailedSubmit}
                disabled={failedLoading}
                className="bg-gradient-to-r from-red-600 to-red-600 hover:from-red-700 hover:to-red-700 text-white"
              >
                {failedLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Marquage...
                  </>
                ) : (
                  "Marquer comme Échec"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <AlertDialog open={!!deleteUid} onOpenChange={(open) => { if (!open) setDeleteUid(null) }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer la transaction</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action ne peut pas être annulée.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Create Transaction Modal */}
        <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle transaction</DialogTitle>
              <DialogDescription>
                Choisir le type de transaction que vous voulez créer
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <Button
                  onClick={() => {
                    setCreateModalOpen(false)
                    router.push("/dashboard/transactions/deposit")
                  }}
                  className="h-20 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <DollarSign className="h-6 w-6" />
                    <span className="font-semibold">Dépôt</span>
                    <span className="text-sm opacity-90">Ajouter de l'argent au compte</span>
                  </div>
                </Button>
                
                <Button
                  onClick={() => {
                    setCreateModalOpen(false)
                    router.push("/dashboard/transactions/withdraw")
                  }}
                  className="h-20 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <TrendingDown className="h-6 w-6" />
                    <span className="font-semibold">Retrait</span>
                    <span className="text-sm opacity-90">Retirer de l'argent du compte</span>
                  </div>
                </Button>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateModalOpen(false)}
              >
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

          </div>
    </div>
  )
}

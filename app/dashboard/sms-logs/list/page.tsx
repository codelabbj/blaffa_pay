"use client"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useEffect, useState, useCallback, Suspense } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Copy,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Download,
  RefreshCw,
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"
import { DateRangeFilter } from "@/components/ui/date-range-filter"

interface PaginationInfo {
  count: number
  next: string | null
  previous: string | null
  results: any[]
}

interface NetworkOption {
  uid: string
  nom?: string
  name?: string
  code?: string
  country?: string | { code?: string }
  country_code?: string
}

interface CountryOption {
  uid?: string
  code: string
  name?: string
  nom?: string
}

const SMS_TYPE_OPTIONS = [
  { value: "all", label: "Tous les types" },
  { value: "deposit", label: "Dépôt" },
  { value: "withdrawal", label: "Retrait" },
  { value: "transaction_confirmation", label: "Confirmation TX" },
  { value: "balance_notification", label: "Solde" },
  { value: "error_notification", label: "Erreur" },
  { value: "unknown", label: "Inconnu" },
]

const STATUS_OPTIONS = [
  { value: "all", label: "Tous les statuts" },
  { value: "pending", label: "À préciser" },
  { value: "approved", label: "Approuvé" },
  { value: "no_order", label: "Pas de commande" },
  { value: "refunded", label: "Remboursé" },
]

function csvEscape(value: unknown): string {
  const raw = String(value ?? "").replace(/\r?\n/g, " ").trim()
  if (raw.includes(",") || raw.includes('"') || raw.includes(";")) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

function SmsLogsListPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateUrl = useCallback(
    (newParams: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(newParams).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all" || (key === "page" && value === 1)) {
          params.delete(key)
        } else {
          params.set(key, value.toString())
        }
      })
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, pathname, router],
  )

  const [paginationData, setPaginationData] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    results: [],
  })
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "")
  const [typeFilter, setTypeFilter] = useState(searchParams.get("sms_type") || "all")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [networkFilter, setNetworkFilter] = useState(searchParams.get("network") || "all")
  const [countryFilter, setCountryFilter] = useState(searchParams.get("country") || "all")
  const [linkedFilter, setLinkedFilter] = useState(searchParams.get("has_transaction") || "all")
  const [moneyOnly, setMoneyOnly] = useState(searchParams.get("money_only") === "1")
  const [sortField, setSortField] = useState<"received_at" | "sender">("received_at")
  const [sortDirection, setSortDirection] = useState<"+" | "-">("-")
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1)
  const [pageSize, setPageSize] = useState(Number(searchParams.get("page_size")) || 100)
  const [startDate, setStartDate] = useState<string | null>(searchParams.get("date_from"))
  const [endDate, setEndDate] = useState<string | null>(searchParams.get("date_to"))

  const [networks, setNetworks] = useState<NetworkOption[]>([])
  const [countries, setCountries] = useState<CountryOption[]>([])

  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast()

  const totalPages = Math.max(1, Math.ceil(paginationData.count / pageSize))
  const startItem = paginationData.count === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, paginationData.count)

  const buildQueryParams = useCallback(
    (page: number, size: number) => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: String(size),
      })
      if (searchTerm.trim()) params.set("search", searchTerm.trim())
      if (typeFilter !== "all") params.set("sms_type", typeFilter)
      if (statusFilter !== "all") params.set("status", statusFilter)
      if (networkFilter !== "all") params.set("network", networkFilter)
      if (countryFilter !== "all") params.set("country", countryFilter)
      if (linkedFilter !== "all") params.set("has_transaction", linkedFilter)
      if (moneyOnly) params.set("money_only", "1")
      if (sortField) params.set("ordering", `${sortDirection}${sortField}`)
      // Backend accepte date_from / date_to (et received_at__*)
      if (startDate) params.set("date_from", startDate)
      if (endDate) params.set("date_to", endDate)
      return params
    },
    [
      searchTerm,
      typeFilter,
      statusFilter,
      networkFilter,
      countryFilter,
      linkedFilter,
      moneyOnly,
      sortField,
      sortDirection,
      startDate,
      endDate,
    ],
  )

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setSearchTerm(searchInput.trim())
      setCurrentPage(1)
      updateUrl({ search: searchInput.trim() || null, page: 1 })
    }, 350)
    return () => window.clearTimeout(timer)
  }, [searchInput]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [nets, countriesData] = await Promise.all([
          apiFetch("payments/networks/?page_size=200"),
          apiFetch("payments/countries/?page_size=200"),
        ])
        setNetworks(Array.isArray(nets) ? nets : nets?.results || [])
        setCountries(Array.isArray(countriesData) ? countriesData : countriesData?.results || [])
      } catch (err) {
        console.error("SMS logs meta fetch error:", err)
      }
    }
    loadMeta()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchSmsLogs = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = buildQueryParams(currentPage, pageSize)
      const query = params.toString().replace(/ordering=%2B/g, "ordering=+")
      const data = await apiFetch(`payments/sms-logs/?${query}`)
      if (data?.results) {
        setPaginationData(data)
      } else {
        setPaginationData({
          count: Array.isArray(data) ? data.length : 0,
          next: null,
          previous: null,
          results: Array.isArray(data) ? data : [],
        })
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("smsLogs.failedToLoad")
      setError(errorMessage)
      setPaginationData({ count: 0, next: null, previous: null, results: [] })
      toast({
        title: t("smsLogs.failedToLoad"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [apiFetch, buildQueryParams, currentPage, pageSize, t, toast])

  useEffect(() => {
    fetchSmsLogs()
  }, [fetchSmsLogs])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    updateUrl({ page })
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      toast({ title: t("common.copied"), description: t("common.copiedToClipboard") })
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const clearFilters = () => {
    setSearchInput("")
    setSearchTerm("")
    setTypeFilter("all")
    setStatusFilter("all")
    setNetworkFilter("all")
    setCountryFilter("all")
    setLinkedFilter("all")
    setMoneyOnly(false)
    setStartDate(null)
    setEndDate(null)
    setCurrentPage(1)
    updateUrl({
      search: null,
      sms_type: null,
      status: null,
      network: null,
      country: null,
      has_transaction: null,
      money_only: null,
      date_from: null,
      date_to: null,
      page: 1,
    })
  }

  const exportCsv = async () => {
    setExporting(true)
    try {
      const pageCap = 50
      const size = 100
      let page = 1
      const rows: any[] = []
      let total = Infinity

      while (page <= pageCap && rows.length < total) {
        const params = buildQueryParams(page, size)
        const query = params.toString().replace(/ordering=%2B/g, "ordering=+")
        const data = await apiFetch(`payments/sms-logs/?${query}`)
        const batch = data?.results || (Array.isArray(data) ? data : [])
        total = typeof data?.count === "number" ? data.count : batch.length
        rows.push(...batch)
        if (!batch.length || !data?.next) break
        page += 1
      }

      const headers = [
        "Date",
        "Time",
        "Sender",
        "Phone/Device",
        "Network",
        "Country",
        "Type",
        "Status",
        "Linked",
        "BT reference",
        "Operator ref",
        "Message",
      ]
      const lines = [headers.join(",")]
      for (const log of rows) {
        const when = log.received_at || log.created_at || ""
        const d = when ? new Date(when) : null
        lines.push(
          [
            d ? d.toISOString().slice(0, 10) : "",
            d ? d.toISOString().slice(11, 19) : "",
            log.sender || "",
            log.device_name || log.device_id || "",
            log.network_name || log.network_code || "",
            log.country_code || "",
            log.sms_type_display || log.sms_type || "",
            log.status_display || log.status || "",
            log.associated_transaction || log.transaction_reference ? "yes" : "no",
            log.transaction_reference || log.associated_external_id || "",
            log.operator_ref || "",
            log.content || log.message || "",
          ]
            .map(csvEscape)
            .join(","),
        )
      }

      const blob = new Blob(["\uFEFF" + lines.join("\n")], {
        type: "text/csv;charset=utf-8;",
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")
      a.href = url
      a.download = `sms-logs-${stamp}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      toast({
        title: "Export CSV",
        description: `${rows.length.toLocaleString("fr-FR")} SMS exportés.`,
      })
    } catch (err: any) {
      toast({
        title: "Export impossible",
        description: extractErrorMessages(err) || String(err),
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const typeLabel = (log: any) => {
    if (log.sms_type_display) return log.sms_type_display
    const hit = SMS_TYPE_OPTIONS.find((o) => o.value === log.sms_type)
    return hit?.label || log.sms_type || "Inconnu"
  }

  return (
    <div className="min-h-screen bg-whiten dark:bg-boxdark-2">
      <div className="w-full">
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center">
            <div>
              <h1 className="text-base font-bold sm:text-lg sm:text-2xl bg-gradient-to-r from-primary to-meta-3 bg-clip-text text-transparent">
                {t("smsLogs.list")}
              </h1>
              <p className="text-body dark:text-bodydark mt-2 text-lg">
                Surveiller les journaux de communication SMS
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="bg-white dark:bg-boxdark rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700 dark:text-bodydark">
                    {paginationData.count.toLocaleString("fr-FR")} messages
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchSmsLogs()}
                disabled={loading}
                className="border-stroke dark:border-strokedark"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </Button>
              <Button
                size="sm"
                onClick={() => void exportCsv()}
                disabled={exporting || loading}
                className="bg-primary hover:bg-primary/90 text-white"
              >
                <Download className="h-4 w-4 mr-1" />
                {exporting ? "Export…" : "Exporter CSV"}
              </Button>
            </div>
          </div>
        </div>

        <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mb-4">
          <CardContent className="p-3 sm:p-4 md:p-6 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
              <div className="relative xl:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-bodydark2" />
                <Input
                  placeholder="Contenu, expéditeur, appareil, réf. opérateur…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark"
                />
              </div>

              <Select
                value={typeFilter}
                onValueChange={(v) => {
                  setTypeFilter(v)
                  setCurrentPage(1)
                  updateUrl({ sms_type: v === "all" ? null : v, page: 1 })
                }}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark">
                  <SelectValue placeholder="Type SMS" />
                </SelectTrigger>
                <SelectContent>
                  {SMS_TYPE_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={(v) => {
                  setStatusFilter(v)
                  setCurrentPage(1)
                  updateUrl({ status: v === "all" ? null : v, page: 1 })
                }}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={networkFilter}
                onValueChange={(v) => {
                  setNetworkFilter(v)
                  setCurrentPage(1)
                  updateUrl({ network: v === "all" ? null : v, page: 1 })
                }}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark">
                  <SelectValue placeholder="Réseau" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les réseaux</SelectItem>
                  {networks.map((n) => {
                    const value = n.uid || n.code || n.nom || n.name || ""
                    const label = n.nom || n.name || n.code || value
                    return value ? (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ) : null
                  })}
                </SelectContent>
              </Select>

              <Select
                value={countryFilter}
                onValueChange={(v) => {
                  setCountryFilter(v)
                  setCurrentPage(1)
                  updateUrl({ country: v === "all" ? null : v, page: 1 })
                }}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {countries.map((c) => {
                    const code = c.code || ""
                    const label = c.name || c.nom || code
                    return code ? (
                      <SelectItem key={code} value={code}>
                        {label} ({code})
                      </SelectItem>
                    ) : null
                  })}
                </SelectContent>
              </Select>

              <Select
                value={linkedFilter}
                onValueChange={(v) => {
                  setLinkedFilter(v)
                  setCurrentPage(1)
                  updateUrl({ has_transaction: v === "all" ? null : v, page: 1 })
                }}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark">
                  <SelectValue placeholder="Liaison TX" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Liés + non liés</SelectItem>
                  <SelectItem value="true">Liés à une TX</SelectItem>
                  <SelectItem value="false">Non liés</SelectItem>
                </SelectContent>
              </Select>

              <DateRangeFilter
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(d) => {
                  setStartDate(d)
                  setCurrentPage(1)
                  updateUrl({ date_from: d, page: 1 })
                }}
                onEndDateChange={(d) => {
                  setEndDate(d)
                  setCurrentPage(1)
                  updateUrl({ date_to: d, page: 1 })
                }}
                onClear={() => {
                  setStartDate(null)
                  setEndDate(null)
                  setCurrentPage(1)
                  updateUrl({ date_from: null, date_to: null, page: 1 })
                }}
                placeholder="Période"
              />

              <Select
                value={pageSize.toString()}
                onValueChange={(value) => {
                  const size = parseInt(value, 10)
                  setPageSize(size)
                  setCurrentPage(1)
                  updateUrl({ page_size: size, page: 1 })
                }}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-meta-4 border-stroke dark:border-strokedark">
                  <SelectValue placeholder="Taille de page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 par page</SelectItem>
                  <SelectItem value="100">100 par page</SelectItem>
                  <SelectItem value="200">200 par page</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-body dark:text-bodydark cursor-pointer">
                <input
                  type="checkbox"
                  checked={moneyOnly}
                  onChange={(e) => {
                    setMoneyOnly(e.target.checked)
                    setCurrentPage(1)
                    updateUrl({ money_only: e.target.checked ? "1" : null, page: 1 })
                  }}
                />
                Flux argent uniquement (dépôts / retraits)
              </label>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Effacer les filtres
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <CardHeader className="border-b border-gray-100 dark:border-strokedark">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-meta-2 dark:bg-orange-900 rounded-lg">
                <MessageSquare className="h-5 w-5 text-primary dark:text-secondary" />
              </div>
              <span>Journaux SMS</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-6 sm:py-10">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="text-body dark:text-bodydark">Chargement des journaux SMS...</span>
                </div>
              </div>
            ) : error ? (
              <div className="p-3 sm:p-4 md:p-6 text-center">
                <ErrorDisplay error={error} onRetry={() => fetchSmsLogs()} />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 dark:bg-boxdark-2/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Expéditeur</TableHead>
                      <TableHead className="font-semibold">Réseau</TableHead>
                      <TableHead className="font-semibold">Message</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Lié</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginationData.results.map((log) => (
                      <TableRow
                        key={log.uid || log.id}
                        className="hover:bg-gray-50 dark:hover:bg-boxdark-2/50"
                      >
                        <TableCell data-label="Date">
                          <div className="text-sm text-body dark:text-bodydark2 whitespace-nowrap">
                            {log.received_at
                              ? new Date(log.received_at).toLocaleString("fr-FR")
                              : log.created_at
                                ? new Date(log.created_at).toLocaleString("fr-FR")
                                : "—"}
                          </div>
                          {log.device_name ? (
                            <div className="text-xs text-bodydark2 mt-1">{log.device_name}</div>
                          ) : null}
                        </TableCell>
                        <TableCell data-label="Type">
                          <Badge
                            className={
                              log.sms_type === "deposit"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : log.sms_type === "withdrawal"
                                  ? "bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300"
                                  : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                            }
                          >
                            {typeLabel(log)}
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Expéditeur">
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-bodydark2" />
                            <span className="font-mono text-sm text-gray-700 dark:text-bodydark">
                              {log.sender || "Inconnu"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell data-label="Réseau">
                          <div className="text-sm">{log.network_name || log.network_code || "—"}</div>
                          {log.country_code ? (
                            <div className="text-xs text-bodydark2">{log.country_code}</div>
                          ) : null}
                        </TableCell>
                        <TableCell data-label="Message">
                          <div className="max-w-md">
                            <div className="text-sm text-gray-900 dark:text-gray-100 break-words whitespace-pre-wrap">
                              {log.content || log.message || "Aucun message"}
                            </div>
                            {log.transaction_reference || log.operator_ref ? (
                              <div className="text-xs text-bodydark2 mt-1 font-mono">
                                {log.transaction_reference
                                  ? `BT: ${log.transaction_reference}`
                                  : ""}
                                {log.transaction_reference && log.operator_ref ? " · " : ""}
                                {log.operator_ref ? `Op: ${log.operator_ref}` : ""}
                              </div>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell data-label="Statut">
                          <Badge
                            className={
                              log.status === "approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : log.status === "refunded" || log.status === "no_order"
                                  ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            }
                          >
                            <div className="flex items-center space-x-1">
                              {log.status === "approved" ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : log.status === "refunded" || log.status === "no_order" ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              <span>{log.status_display || log.status || "Inconnu"}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell data-label="Lié">
                          {log.associated_transaction || log.transaction_reference ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                              Lié
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                              Non lié
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell data-label="Actions">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(log.content || log.message || "")}
                            className={
                              copied === (log.content || log.message)
                                ? "bg-green-50 text-green-700 border-green-200"
                                : ""
                            }
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            {copied === (log.content || log.message) ? "Copié!" : "Copier"}
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

        {totalPages > 1 && !loading && !error && (
          <div className="flex flex-wrap items-start justify-between gap-3 sm:items-center mt-6">
            <div className="text-sm text-body dark:text-bodydark2">
              Affichage de {startItem} à {endItem} sur {paginationData.count.toLocaleString("fr-FR")}{" "}
              résultats
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Précédent
              </Button>
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages: Array<number | "..."> = []
                  for (let i = 1; i <= totalPages; i++) {
                    if (i === 1 || i === totalPages || Math.abs(i - currentPage) <= 1) {
                      pages.push(i)
                    } else if (pages[pages.length - 1] !== "...") {
                      pages.push("...")
                    }
                  }
                  return pages.map((page, index) => {
                    if (page === "...") {
                      return (
                        <span key={`ellipsis-${index}`} className="px-2 text-body text-sm">
                          ...
                        </span>
                      )
                    }
                    return (
                      <Button
                        key={`page-${page}`}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page as number)}
                        className={
                          currentPage === page
                            ? "bg-primary hover:bg-primary text-white border-primary"
                            : "border-stroke dark:border-strokedark"
                        }
                      >
                        {page}
                      </Button>
                    )
                  })
                })()}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {!loading && !error && paginationData.results.length === 0 && (
          <Card className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark mt-6">
            <CardContent className="p-12 text-center">
              <MessageSquare className="h-12 w-12 text-bodydark2 mx-auto mb-4" />
              <h3 className="text-sm font-medium sm:text-base text-gray-900 dark:text-gray-100 mb-2">
                Aucun journal SMS trouvé
              </h3>
              <p className="text-body dark:text-bodydark2 mb-4">
                {searchTerm
                  ? `Aucun journal SMS ne correspond à « ${searchTerm} »`
                  : "Aucun journal SMS pour ces filtres."}
              </p>
              <Button variant="outline" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default function SmsLogsListPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SmsLogsListPageContent />
    </Suspense>
  )
}

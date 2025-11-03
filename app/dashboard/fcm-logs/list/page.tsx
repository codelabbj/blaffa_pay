"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Search, ArrowUpDown, ChevronLeft, ChevronRight, Bell, Filter, CheckCircle, XCircle, Clock, Smartphone } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"
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

interface PaginationInfo {
  count: number
  next: string | null
  previous: string | null
  results: any[]
}

export default function FcmLogsListPage() {
  const [paginationData, setPaginationData] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    results: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [sortField, setSortField] = useState<"created_at" | "device_id" | null>(null)
  const [sortDirection, setSortDirection] = useState<"+" | "-">("-")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(100)
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast()

  // Calculate pagination info
  const totalPages = Math.ceil(paginationData.count / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, paginationData.count)

  useEffect(() => {
    const fetchFcmLogs = async () => {
      setLoading(true)
      setError("")
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: pageSize.toString(),
        })
        
        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm)
        }
        if (deviceFilter !== "all") {
          params.append("device_id", deviceFilter)
        }
        if (sortField) {
          params.append("ordering", `${sortDirection}${sortField}`)
        }
        if (startDate) {
          params.append("created_at__gte", startDate)
        }
        if (endDate) {
          params.append("created_at__lte", endDate)
        }
        
        const query = params.toString().replace(/ordering=%2B/g, "ordering=+")
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/fcm-logs/?${query}`
        
        const data = await apiFetch(endpoint)
        
        // Handle both paginated and non-paginated responses
        if (data.results) {
          setPaginationData(data)
        } else {
          // Fallback for non-paginated response
          setPaginationData({
            count: Array.isArray(data) ? data.length : 0,
            next: null,
            previous: null,
            results: Array.isArray(data) ? data : []
          })
        }
        
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("fcmLogs.failedToLoad")
        setError(errorMessage)
        setPaginationData({
          count: 0,
          next: null,
          previous: null,
          results: []
        })
        toast({
          title: t("fcmLogs.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('FCM logs fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFcmLogs()
  }, [searchTerm, deviceFilter, sortField, sortDirection, currentPage, pageSize, startDate, endDate])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      toast({
        title: t("common.copied"),
        description: t("common.copiedToClipboard"),
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSort = (field: "created_at" | "device_id") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "+" ? "-" : "+"))
      setSortField(field)
    } else {
      setSortField(field)
      setSortDirection("-")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                {t("fcmLogs.list")}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Surveiller les journaux Firebase Cloud Messaging
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {paginationData.count} notifications
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
                  placeholder="Rechercher dans les journaux FCM..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                />
              </div>

              {/* Device Filter */}
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Filtrer par appareil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les appareils</SelectItem>
                  {/* Add device options here if available */}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select 
                value={sortField || ""} 
                onValueChange={(value) => setSortField(value as "created_at" | "device_id" | null)}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="device_id">Appareil</SelectItem>
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
              />

              {/* Page Size */}
              <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Taille de page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50 par page</SelectItem>
                  <SelectItem value="100">100 par page</SelectItem>
                  <SelectItem value="200">200 par page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* FCM Logs Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Bell className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <span>Journaux FCM</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Chargement des journaux FCM...</span>
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
                      <TableHead className="font-semibold">Appareil</TableHead>
                      <TableHead className="font-semibold">Message</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginationData.results.map((log) => (
                      <TableRow key={log.id || log.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4 text-gray-400" />
                            <Badge variant="outline" className="font-mono text-xs">
                              {log.device_id || 'Inconnu'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <div className="text-sm text-gray-900 dark:text-gray-100 break-words whitespace-pre-wrap">
                              {log.message || log.title || log.body || 'Aucun message'}
                            </div>
                            {log.data && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 break-words">
                                Données: {JSON.stringify(log.data)}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              log.status === 'success' || log.status === 'delivered'
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : log.status === 'failed' || log.status === 'error'
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                            }
                          >
                            <div className="flex items-center space-x-1">
                              {log.status === 'success' || log.status === 'delivered' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : log.status === 'failed' || log.status === 'error' ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              <span>{log.status || 'Inconnu'}</span>
                            </div>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {log.created_at 
                              ? new Date(log.created_at).toLocaleString()
                              : 'Inconnu'
                            }
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCopy(JSON.stringify(log, null, 2))}
                            className={copied === JSON.stringify(log, null, 2) ? "bg-green-50 text-green-700 border-green-200" : ""}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            {copied === JSON.stringify(log, null, 2) ? 'Copié!' : 'Copier'}
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
              Affichage de {startItem} à {endItem} sur {paginationData.count} résultats
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
        {!loading && !error && paginationData.results.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
            <CardContent className="p-12 text-center">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucun journal FCM trouvé
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? `Aucun journal FCM ne correspond à "${searchTerm}"` : "Aucun journal FCM n'a encore été enregistré."}
              </p>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
}
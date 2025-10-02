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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Users, Filter, CheckCircle, XCircle, Mail, Calendar, UserCheck, DollarSign, TrendingUp, Clock, ArrowUpDown as ArrowUpDownIcon, Plus, Eye, Edit, Trash2, ToggleLeft, ToggleRight, BarChart3, Shield, User, AlertTriangle, RefreshCw, Settings, Key, Globe, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

interface ApiConfig {
  uid: string;
  name: string;
  base_url: string;
  public_key: string;
  timeout_seconds: number;
  is_active: boolean;
  updated_by: number;
  updated_by_name: string;
  created_at: string;
  updated_at: string;
}

export default function ApiConfigPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [configs, setConfigs] = useState<ApiConfig[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortField, setSortField] = useState<"name" | "created_at" | "is_active" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const { t } = useLanguage()
  const itemsPerPage = 20
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const apiFetch = useApi();
  const router = useRouter()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailConfig, setDetailConfig] = useState<ApiConfig | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editConfig, setEditConfig] = useState<ApiConfig | null>(null)
  const [form, setForm] = useState({
    name: "",
    base_url: "",
    public_key: "",
    secret_key: "",
    timeout_seconds: 30,
    is_active: true,
  })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState("")

  // Fetch API configs from API
  useEffect(() => {
    const fetchConfigs = async () => {
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
          params.append("is_active", statusFilter === "active" ? "true" : "false")
        }
        const orderingParam = sortField
          ? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
          : "&ordering=-created_at"
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/api-config/?${params.toString()}${orderingParam}`
        const data = await apiFetch(endpoint)
        setConfigs(data.results || [])
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
        toast({ title: "Succès", description: "Configurations API chargées avec succès" })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        setConfigs([])
        setTotalCount(0)
        setTotalPages(1)
        toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchConfigs()
  }, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, sortField, sortDirection, t, toast, apiFetch])

  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "name" | "created_at" | "is_active") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Fetch config details
  const handleOpenDetail = async (config: ApiConfig) => {
    setDetailModalOpen(true)
    setDetailLoading(true)
    setDetailError("")
    setDetailConfig(null)
    try {
      setDetailConfig(config)
      toast({ title: "Succès", description: "Détails de la configuration chargés" })
    } catch (err: any) {
      setDetailError(extractErrorMessages(err))
      toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
    } finally {
      setDetailLoading(false)
    }
  }

  // Open create modal
  const handleOpenCreate = () => {
    setForm({
      name: "",
      base_url: "",
      public_key: "",
      secret_key: "",
      timeout_seconds: 30,
      is_active: true,
    })
    setCreateModalOpen(true)
    setFormError("")
  }

  // Open edit modal
  const handleOpenEdit = (config: ApiConfig) => {
    setEditConfig(config)
    setForm({
      name: config.name,
      base_url: config.base_url,
      public_key: config.public_key,
      secret_key: "", // Don't show existing secret key
      timeout_seconds: config.timeout_seconds,
      is_active: config.is_active,
    })
    setEditModalOpen(true)
    setFormError("")
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setFormError("")

    try {
      const payload = {
        name: form.name,
        base_url: form.base_url,
        public_key: form.public_key,
        secret_key: form.secret_key,
        timeout_seconds: form.timeout_seconds,
        is_active: form.is_active,
      }

      let endpoint, method
      if (editConfig) {
        // Update existing config
        endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/api-config/${editConfig.uid}/`
        method = "PATCH"
      } else {
        // Create new config
        endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/api-config/`
        method = "POST"
      }

      const data = await apiFetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      toast({ 
        title: "Succès", 
        description: `Configuration API ${editConfig ? 'mise à jour' : 'créée'} avec succès` 
      })
      
      if (editConfig) {
        setEditModalOpen(false)
        setEditConfig(null)
      } else {
        setCreateModalOpen(false)
      }
      
      // Refresh the list
      window.location.reload()
    } catch (err: any) {
      setFormError(extractErrorMessages(err))
      toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
    } finally {
      setFormLoading(false)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Actif</span>
          </div>
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
          <div className="flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Inactif</span>
          </div>
        </Badge>
      )
    }
  }

  // Calculate summary stats
  const activeConfigs = configs.filter(c => c.is_active).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                Configuration API
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gérer les configurations API des plateformes de paris
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {totalCount} configurations
                  </span>
                </div>
              </div>
              <Button 
                onClick={handleOpenCreate}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Configuration
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Configurations</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalCount}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Configurations actives</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {activeConfigs}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Key className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Configurations inactives</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalCount - activeConfigs}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des configurations..."
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
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select 
                value={sortField || ""} 
                onValueChange={(value) => setSortField(value as "name" | "created_at" | "is_active" | null)}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nom</SelectItem>
                  <SelectItem value="created_at">Date</SelectItem>
                  <SelectItem value="is_active">Statut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Configurations Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Settings className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <span>Liste des configurations API</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Chargement des configurations...</span>
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
                      <TableHead className="font-semibold">Nom</TableHead>
                      <TableHead className="font-semibold">URL de base</TableHead>
                      <TableHead className="font-semibold">Clé publique</TableHead>
                      <TableHead className="font-semibold">Timeout</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Mis à jour par</TableHead>
                      <TableHead className="font-semibold">Créé le</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {configs.map((config) => (
                      <TableRow key={config.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {config.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {config.name}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                              {config.base_url}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Key className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                              {config.public_key.substring(0, 20)}...
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Timer className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {config.timeout_seconds}s
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(config.is_active)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {config.updated_by_name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {config.created_at 
                                ? new Date(config.created_at).toLocaleDateString()
                                : 'Inconnu'
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenDetail(config)}
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenEdit(config)}
                              className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900/30"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
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
        {!loading && !error && configs.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucune configuration trouvée
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? `Aucune configuration ne correspond à "${searchTerm}"` : "Aucune configuration API n'a encore été créée."}
              </p>
              <Button 
                onClick={handleOpenCreate}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Créer une configuration
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <span>Détails de la configuration API</span>
              </DialogTitle>
            </DialogHeader>
            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : detailError ? (
              <ErrorDisplay error={detailError} />
            ) : detailConfig ? (
              <div className="space-y-6">
                {/* Configuration Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                        <Settings className="h-5 w-5 mr-2" />
                        Configuration
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom:</span>
                          <p className="text-lg font-semibold text-blue-600">
                            {detailConfig.name}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">URL de base:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                            {detailConfig.base_url}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Timeout:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            {detailConfig.timeout_seconds} secondes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-3 flex items-center">
                        <Key className="h-5 w-5 mr-2" />
                        Clés API
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Clé publique:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100 font-mono break-all">
                            {detailConfig.public_key}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut:</span>
                          <div className="mt-1">
                            {getStatusBadge(detailConfig.is_active)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis à jour par:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {detailConfig.updated_by_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Créé le:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {detailConfig.created_at 
                        ? new Date(detailConfig.created_at).toLocaleString()
                        : 'Non disponible'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis à jour le:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {detailConfig.updated_at 
                        ? new Date(detailConfig.updated_at).toLocaleString()
                        : 'Non disponible'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Create/Edit Modal */}
        <Dialog open={createModalOpen || editModalOpen} onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false)
            setEditModalOpen(false)
            setEditConfig(null)
            setFormError("")
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5 text-orange-600" />
                <span>{editConfig ? 'Modifier' : 'Créer'} Configuration API</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              {formError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <ErrorDisplay error={formError} />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de la configuration *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="timeout_seconds">Timeout (secondes) *</Label>
                  <Input
                    id="timeout_seconds"
                    type="number"
                    min="1"
                    max="300"
                    value={form.timeout_seconds}
                    onChange={(e) => setForm(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) }))}
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="base_url">URL de base *</Label>
                <Input
                  id="base_url"
                  type="url"
                  value={form.base_url}
                  onChange={(e) => setForm(prev => ({ ...prev, base_url: e.target.value }))}
                  className="mt-1"
                  placeholder="https://api.example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="public_key">Clé publique *</Label>
                <Input
                  id="public_key"
                  value={form.public_key}
                  onChange={(e) => setForm(prev => ({ ...prev, public_key: e.target.value }))}
                  className="mt-1"
                  placeholder="pk_live_..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="secret_key">{editConfig ? 'Nouvelle clé secrète (laisser vide pour conserver)' : 'Clé secrète *'}</Label>
                <Input
                  id="secret_key"
                  type="password"
                  value={form.secret_key}
                  onChange={(e) => setForm(prev => ({ ...prev, secret_key: e.target.value }))}
                  className="mt-1"
                  placeholder="sk_live_..."
                  required={!editConfig}
                />
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onCheckedChange={(checked) => setForm(prev => ({ ...prev, is_active: checked }))}
                />
                <Label htmlFor="is_active" className="text-sm font-medium">
                  Configuration active
                </Label>
              </div>

              <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="submit"
                  disabled={formLoading}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {editConfig ? 'Mise à jour...' : 'Création...'}
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      {editConfig ? 'Mettre à jour' : 'Créer'} Configuration
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setCreateModalOpen(false)
                    setEditModalOpen(false)
                    setEditConfig(null)
                    setFormError("")
                  }}
                  disabled={formLoading}
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

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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Users, Filter, CheckCircle, XCircle, Mail, Calendar, UserCheck, DollarSign, TrendingUp, Clock, ArrowUpDown as ArrowUpDownIcon, Plus, Eye, Edit, Trash2, ToggleLeft, ToggleRight, BarChart3, Shield, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import Link from "next/link"
import { useRouter } from "next/navigation"

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

interface Permission {
  uid: string;
  partner: string;
  partner_name: string;
  platform: string;
  platform_name: string;
  platform_external_id: string;
  platform_min_deposit: string;
  platform_max_deposit: string;
  platform_min_withdrawal: string;
  platform_max_withdrawal: string;
  can_deposit: boolean;
  can_withdraw: boolean;
  is_active: boolean;
  granted_by: number;
  granted_by_name: string;
  created_at: string;
  updated_at: string;
}

export default function PermissionsListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [platformFilter, setPlatformFilter] = useState("all")
  const [canDepositFilter, setCanDepositFilter] = useState("all")
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortField, setSortField] = useState<"partner_name" | "platform_name" | "created_at" | "is_active" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const { t } = useLanguage()
  const itemsPerPage = 20
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const apiFetch = useApi();
  const router = useRouter()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailPermission, setDetailPermission] = useState<Permission | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editPermission, setEditPermission] = useState<Permission | null>(null)
  const [editForm, setEditForm] = useState({
    can_deposit: false,
    can_withdraw: false,
    is_active: false,
  })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")

  // Fetch permissions from API
  useEffect(() => {
    const fetchPermissions = async () => {
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
        if (platformFilter !== "all") {
          params.append("platform", platformFilter)
        }
        if (canDepositFilter !== "all") {
          params.append("can_deposit", canDepositFilter === "true" ? "true" : "false")
        }
        if (startDate) {
          params.append("created_at__gte", startDate)
        }
        if (endDate) {
          params.append("created_at__lt", endDate)
        }
        const orderingParam = sortField
          ? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
          : ""
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/permissions/?${params.toString()}${orderingParam}`
        const data = await apiFetch(endpoint)
        setPermissions(data.results || [])
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        setPermissions([])
        setTotalCount(0)
        setTotalPages(1)
        toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchPermissions()
  }, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, platformFilter, canDepositFilter, sortField, sortDirection, startDate, endDate, t, toast, apiFetch])

  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "partner_name" | "platform_name" | "created_at" | "is_active") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  // Fetch permission details
  const handleOpenDetail = async (permission: Permission) => {
    setDetailModalOpen(true)
    setDetailLoading(true)
    setDetailError("")
    setDetailPermission(null)
    try {
      setDetailPermission(permission)
    } catch (err: any) {
      setDetailError(extractErrorMessages(err))
      toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
    } finally {
      setDetailLoading(false)
    }
  }

  // Open edit modal
  const handleOpenEdit = async (permission: Permission) => {
    setEditPermission(permission)
    setEditForm({
      can_deposit: permission.can_deposit,
      can_withdraw: permission.can_withdraw,
      is_active: permission.is_active,
    })
    setEditModalOpen(true)
    setEditError("")
  }

  // Navigate to user platform permissions page
  const handleOpenUserPlatforms = (permission: Permission) => {
    router.push(`/dashboard/permissions/platforms/${permission.partner}`)
  }

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editPermission) return

    setEditLoading(true)
    setEditError("")
    try {
      const payload = {
        can_deposit: editForm.can_deposit,
        can_withdraw: editForm.can_withdraw,
        is_active: editForm.is_active,
      }

      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/permissions/${editPermission.uid}/`
      const data = await apiFetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      // Update the permission in the list
      setPermissions(prev => prev.map(p => 
        p.uid === editPermission.uid 
          ? { ...p, ...data }
          : p
      ))

      toast({ 
        title: "Succès", 
        description: "Permission mise à jour avec succès" 
      })
      
      setEditModalOpen(false)
      setEditPermission(null)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setEditError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setEditLoading(false)
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

  const getPermissionBadge = (canDeposit: boolean, canWithdraw: boolean) => {
    if (canDeposit && canWithdraw) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <div className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Dépôt + Retrait</span>
          </div>
        </Badge>
      )
    } else if (canDeposit) {
      return (
        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
          <div className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3" />
            <span>Dépôt uniquement</span>
          </div>
        </Badge>
      )
    } else if (canWithdraw) {
      return (
        <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300">
          <div className="flex items-center space-x-1">
            <TrendingUp className="h-3 w-3" />
            <span>Retrait uniquement</span>
          </div>
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300">
          <div className="flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Aucune permission</span>
          </div>
        </Badge>
      )
    }
  }

  // Calculate summary stats
  const activePermissions = permissions.filter(p => p.is_active).length
  const depositPermissions = permissions.filter(p => p.can_deposit).length
  const withdrawPermissions = permissions.filter(p => p.can_withdraw).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                Gestion des Permissions
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base lg:text-lg">
                Gérer les permissions des partenaires sur les plateformes de paris
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
                  <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                    {totalCount} permissions
                  </span>
                </div>
              </div>
              <Link href="/dashboard/permissions/create">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs sm:text-sm">
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Nouvelle Permission</span>
                  <span className="sm:hidden">Nouvelle</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Permissions actives</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {activePermissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions de dépôt</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {depositPermissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions de retrait</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {withdrawPermissions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des permissions..."
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

              {/* Platform Filter */}
              <Select value={platformFilter} onValueChange={setPlatformFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Filtrer par plateforme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les plateformes</SelectItem>
                  {Array.from(new Set(permissions.map(p => p.platform))).map(platformId => {
                    const platform = permissions.find(p => p.platform === platformId)
                    return (
                      <SelectItem key={platformId} value={platformId}>
                        {platform?.platform_name || platformId}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {/* Can Deposit Filter */}
              <Select value={canDepositFilter} onValueChange={setCanDepositFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Filtrer par dépôt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les permissions</SelectItem>
                  <SelectItem value="true">Peut déposer</SelectItem>
                  <SelectItem value="false">Ne peut pas déposer</SelectItem>
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

        {/* Permissions Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Shield className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <span>Liste des permissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Chargement des permissions...</span>
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
                      <TableHead className="font-semibold">Partenaire</TableHead>
                      <TableHead className="font-semibold">Plateforme</TableHead>
                      <TableHead className="font-semibold">Permissions</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Limites</TableHead>
                      <TableHead className="font-semibold">Créé le</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {permissions.map((permission) => (
                      <TableRow key={permission.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {permission.partner_name?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {permission.partner_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {permission.partner}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {permission.platform_name?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {permission.platform_name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {permission.platform_external_id}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getPermissionBadge(permission.can_deposit, permission.can_withdraw)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(permission.is_active)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-gray-600 dark:text-gray-400">
                              Dépôt: {parseFloat(permission.platform_min_deposit).toFixed(0)} - {parseFloat(permission.platform_max_deposit).toFixed(0)} FCFA
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              Retrait: {parseFloat(permission.platform_min_withdrawal).toFixed(0)} - {parseFloat(permission.platform_max_withdrawal).toFixed(0)} FCFA
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {permission.created_at 
                                ? new Date(permission.created_at).toLocaleDateString()
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
                              onClick={() => handleOpenDetail(permission)}
                              className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Détails
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenEdit(permission)}
                              className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900/30"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Modifier
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleOpenUserPlatforms(permission)}
                              className="bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-700 dark:hover:bg-purple-900/30"
                            >
                              <Users className="h-4 w-4 mr-1" />
                              Plateformes
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
        {!loading && !error && permissions.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
            <CardContent className="p-12 text-center">
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucune permission trouvée
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? `Aucune permission ne correspond à "${searchTerm}"` : "Aucune permission n'a encore été créée."}
              </p>
              <Link href="/dashboard/permissions/create">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une permission
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Detail Modal */}
        <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-orange-600" />
                <span>Détails de la permission</span>
              </DialogTitle>
            </DialogHeader>
            {detailLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : detailError ? (
              <ErrorDisplay error={detailError} />
            ) : detailPermission ? (
              <div className="space-y-6">
                {/* Partner and Platform Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      Partenaire
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom:</span>
                        <p className="text-lg font-semibold text-blue-600">
                          {detailPermission.partner_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ID:</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {detailPermission.partner}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-3 flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Plateforme
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom:</span>
                        <p className="text-lg font-semibold text-orange-600">
                          {detailPermission.platform_name}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ID Externe:</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {detailPermission.platform_external_id}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Permissions</h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Peut déposer:</span>
                        <Badge className={detailPermission.can_deposit ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"}>
                          {detailPermission.can_deposit ? "Oui" : "Non"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Peut retirer:</span>
                        <Badge className={detailPermission.can_withdraw ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"}>
                          {detailPermission.can_withdraw ? "Oui" : "Non"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Statut:</span>
                        {getStatusBadge(detailPermission.is_active)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Limites de la Plateforme</h4>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Dépôt:</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {parseFloat(detailPermission.platform_min_deposit).toFixed(2)} - {parseFloat(detailPermission.platform_max_deposit).toFixed(2)} FCFA
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Retrait:</span>
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {parseFloat(detailPermission.platform_min_withdrawal).toFixed(2)} - {parseFloat(detailPermission.platform_max_withdrawal).toFixed(2)} FCFA
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Accordé par:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {detailPermission.granted_by_name}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Créé le:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {detailPermission.created_at 
                        ? new Date(detailPermission.created_at).toLocaleString()
                        : 'Non disponible'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis à jour le:</span>
                    <p className="text-sm text-gray-900 dark:text-gray-100">
                      {detailPermission.updated_at 
                        ? new Date(detailPermission.updated_at).toLocaleString()
                        : 'Non disponible'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Edit Modal */}
        <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-orange-600" />
                <span>Modifier la permission</span>
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-6">
              {editError && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                  <ErrorDisplay error={editError} />
                </div>
              )}

              {editPermission && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                    {editPermission.partner_name} - {editPermission.platform_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Modifier les permissions pour cette combinaison partenaire/plateforme
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="can_deposit"
                    checked={editForm.can_deposit}
                    onChange={(e) => setEditForm(prev => ({ ...prev, can_deposit: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_deposit" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Peut effectuer des dépôts
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="can_withdraw"
                    checked={editForm.can_withdraw}
                    onChange={(e) => setEditForm(prev => ({ ...prev, can_withdraw: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="can_withdraw" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Peut effectuer des retraits
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={editForm.is_active}
                    onChange={(e) => setEditForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Permission active
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
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
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Mettre à jour
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  disabled={editLoading}
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

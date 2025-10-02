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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Users, Filter, CheckCircle, XCircle, Mail, Calendar, UserCheck, DollarSign, TrendingUp, Clock, ArrowUpDown as ArrowUpDownIcon, Plus, Edit, Trash2, ToggleLeft, ToggleRight, BarChart3, AlertTriangle } from "lucide-react"
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

interface Platform {
  uid: string;
  name: string;
  external_id: string;
  logo: string | null;
  is_active: boolean;
  min_deposit_amount: string;
  max_deposit_amount: string;
  min_withdrawal_amount: string;
  max_withdrawal_amount: string;
  description: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  active_partners_count: number;
  total_transactions_count: number;
}


export default function PlatformsListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [startDate, setStartDate] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [platforms, setPlatforms] = useState<Platform[]>([])
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
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [platformToDelete, setPlatformToDelete] = useState<Platform | null>(null)

  // Fetch platforms from API
  useEffect(() => {
    const fetchPlatforms = async () => {
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
        if (startDate) {
          params.append("created_at__gte", startDate)
        }
        if (endDate) {
          params.append("created_at__lt", endDate)
        }
        const orderingParam = sortField
          ? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
          : ""
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/platforms/?${params.toString()}${orderingParam}`
        const data = await apiFetch(endpoint)
        setPlatforms(data.results || [])
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
        toast({ title: "Succès", description: "Plateformes chargées avec succès" })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        setPlatforms([])
        setTotalCount(0)
        setTotalPages(1)
        toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchPlatforms()
  }, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, sortField, sortDirection, startDate, endDate, t, toast, apiFetch])

  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "name" | "created_at" | "is_active") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }


  // Toggle platform status
  const handleToggleStatus = async (platform: Platform) => {
    setToggleLoading(platform.uid)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/platforms/${platform.uid}/toggle_status/`
      const data = await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      
      // Update the platform in the list
      setPlatforms(prev => prev.map(p => 
        p.uid === platform.uid 
          ? { ...p, is_active: data.is_active }
          : p
      ))
      
      toast({ 
        title: "Succès", 
        description: data.message || `Plateforme ${data.is_active ? 'activée' : 'désactivée'}` 
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setToggleLoading(null)
    }
  }

  // Delete platform
  const handleDeletePlatform = async () => {
    if (!platformToDelete) return
    
    setDeleteLoading(platformToDelete.uid)
    try {
      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/platforms/${platformToDelete.uid}/`
      await apiFetch(endpoint, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
      
      // Remove the platform from the list
      setPlatforms(prev => prev.filter(p => p.uid !== platformToDelete.uid))
      setTotalCount(prev => prev - 1)
      
      toast({ 
        title: "Succès", 
        description: `Plateforme "${platformToDelete.name}" supprimée avec succès` 
      })
      
      setDeleteModalOpen(false)
      setPlatformToDelete(null)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setDeleteLoading(null)
    }
  }

  // Open delete confirmation modal
  const openDeleteModal = (platform: Platform) => {
    setPlatformToDelete(platform)
    setDeleteModalOpen(true)
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
  const activePlatforms = platforms.filter(p => p.is_active).length
  const totalPartners = platforms.reduce((sum, platform) => sum + platform.active_partners_count, 0)
  const totalTransactions = platforms.reduce((sum, platform) => sum + platform.total_transactions_count, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                Gestion des Plateformes de Paris
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gérer les plateformes de paris et leurs configurations
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {totalCount} plateformes
                  </span>
                </div>
              </div>
              <Link href="/dashboard/platforms/create">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle Plateforme
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Plateformes actives</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {activePlatforms}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Partenaires actifs</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalPartners}
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
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transactions totales</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {totalTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des plateformes..."
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

        {/* Platforms Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <Users className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
              <span>Liste des plateformes</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Chargement des plateformes...</span>
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
                      <TableHead className="font-semibold">Plateforme</TableHead>
                      <TableHead className="font-semibold">Limites</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Partenaires</TableHead>
                      <TableHead className="font-semibold">Transactions</TableHead>
                      <TableHead className="font-semibold">Créé le</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platforms.map((platform) => (
                      <TableRow key={platform.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {platform.name?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {platform.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {platform.description}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div className="text-gray-600 dark:text-gray-400">
                              Dépôt: {parseFloat(platform.min_deposit_amount).toFixed(0)} - {parseFloat(platform.max_deposit_amount).toFixed(0)} FCFA
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              Retrait: {parseFloat(platform.min_withdrawal_amount).toFixed(0)} - {parseFloat(platform.max_withdrawal_amount).toFixed(0)} FCFA
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(platform.is_active)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {platform.active_partners_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                              {platform.total_transactions_count}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {platform.created_at 
                                ? new Date(platform.created_at).toLocaleDateString()
                                : 'Inconnu'
                              }
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/platforms/edit/${platform.uid}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900/30"
                              >
                                <Edit className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleToggleStatus(platform)}
                              disabled={toggleLoading === platform.uid}
                              className={platform.is_active 
                                ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/30"
                                : "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/30"
                              }
                            >
                              {toggleLoading === platform.uid ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : platform.is_active ? (
                                <ToggleLeft className="h-4 w-4 mr-1" />
                              ) : (
                                <ToggleRight className="h-4 w-4 mr-1" />
                              )}
                              {platform.is_active ? 'Désactiver' : 'Activer'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openDeleteModal(platform)}
                              disabled={deleteLoading === platform.uid}
                              className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700 dark:hover:bg-red-900/30"
                            >
                              {deleteLoading === platform.uid ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <Trash2 className="h-4 w-4 mr-1" />
                              )}
                              Supprimer
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
        {!loading && !error && platforms.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                Aucune plateforme trouvée
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? `Aucune plateforme ne correspond à "${searchTerm}"` : "Aucune plateforme n'a encore été créée."}
              </p>
              <Link href="/dashboard/platforms/create">
                <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une plateforme
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Delete Confirmation Modal */}
        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Confirmer la suppression</span>
              </DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Êtes-vous sûr de vouloir supprimer la plateforme <strong>"{platformToDelete?.name}"</strong> ?
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">
                  <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées à cette plateforme seront supprimées définitivement.
                </p>
              </div>
            </div>
            <DialogFooter className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setPlatformToDelete(null)
                }}
                disabled={deleteLoading !== null}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeletePlatform}
                disabled={deleteLoading !== null}
                className="flex-1"
              >
                {deleteLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Suppression...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}

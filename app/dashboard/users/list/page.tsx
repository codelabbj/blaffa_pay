"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, ArrowUpDown, Users, Filter, Eye, CheckCircle, XCircle, Clock, Shield, Mail, Phone, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { useApi } from "@/lib/useApi"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Copy } from "lucide-react"

// Colors for consistent theming
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981', 
  accent: '#F59E0B',
  danger: '#EF4444',
  warning: '#F97316',
  success: '#22C55E',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
};

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [users, setUsers] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortField, setSortField] = useState<"display_name" | "email" | "created_at" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const { t } = useLanguage()
  const itemsPerPage = 10
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const [viewType, setViewType] = useState("all")
  const { toast } = useToast()
  const [activatingUid, setActivatingUid] = useState<string | null>(null)
  const [deactivatingUid, setDeactivatingUid] = useState<string | null>(null)
  const [selectedUids, setSelectedUids] = useState<string[]>([])
  const allSelected = users.length > 0 && users.every((u) => selectedUids.includes(u.uid))
  const someSelected = users.some((u) => selectedUids.includes(u.uid))
  const apiFetch = useApi();
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [detailUser, setDetailUser] = useState<any | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState("")
  
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingPartner, setVerifyingPartner] = useState(false);

  const [confirmEmailToggle, setConfirmEmailToggle] = useState<null | boolean>(null);
  const [confirmPhoneToggle, setConfirmPhoneToggle] = useState<null | boolean>(null);
  const [confirmPartnerToggle, setConfirmPartnerToggle] = useState<null | boolean>(null);

  const [confirmActionUser, setConfirmActionUser] = useState<any | null>(null);
  const [confirmActionType, setConfirmActionType] = useState<"activate" | "deactivate" | null>(null);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError("");
      try {
        let endpoint = "";
        if (searchTerm.trim() !== "" || statusFilter !== "all" || sortField) {
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
          const orderingParam = sortField
            ? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${(sortField === "display_name" ? "display_name" : sortField)}`
            : "";
          endpoint =
            viewType === "pending"
              ? `${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/pending/?${params.toString()}${orderingParam}`
              : `${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/?${params.toString()}${orderingParam}`;
        } else {
          const params = new URLSearchParams({
            page: currentPage.toString(),
            page_size: itemsPerPage.toString(),
          });
          endpoint =
            viewType === "pending"
              ? `${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/pending/?${params.toString()}`
              : `${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/?${params.toString()}`;
        }
        console.log("User API endpoint:", endpoint);
        const data = await apiFetch(endpoint);
        console.log("API response data:", data);
        
        // Handle the actual API response structure
        const users = data.users || data.results || [];
        const totalCount = data.pagination?.total_count || data.count || 0;
        const totalPages = data.pagination?.total_pages || Math.ceil(totalCount / itemsPerPage);
        
        setUsers(users);
        setTotalCount(totalCount);
        setTotalPages(totalPages);
        toast({
          title: "Succès",
          description: "Utilisateurs chargés avec succès",
        });
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || "Échec du chargement des utilisateurs";
        setError(errorMessage);
        setUsers([]);
        toast({
          title: "Échec du chargement des utilisateurs",
          description: errorMessage,
          variant: "destructive",
        });
        console.error('Users fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [searchTerm, statusFilter, currentPage, sortField, sortDirection, viewType]);

  const filteredUsers = users // Filtering is now handled by the API
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedUsers = filteredUsers // Already paginated by API

  const handleSort = (field: "display_name" | "email" | "created_at") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      pending: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{t(`users.${status}`)}</Badge>
  }

  // Activate user handler
  const handleActivate = async (user: any) => {
    if (!user.uid) return
    setActivatingUid(user.uid)
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${user.uid}/activate/`, {
        method: "PATCH",
      })
      toast({ title: "Utilisateur activé", description: data.message || "Utilisateur activé avec succès" })
      setUsers((prev) => prev.map((u) => (u.uid === user.uid ? { ...u, ...data.user } : u)))
    } catch (err: any) {
      toast({ title: "Échec de l'activation", description: extractErrorMessages(err) || "Impossible d'activer l'utilisateur", variant: "destructive" })
    } finally {
      setActivatingUid(null)
    }
  }

  // Deactivate user handler
  const handleDeactivate = async (user: any) => {
    if (!user.uid) return
    setDeactivatingUid(user.uid)
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${user.uid}/deactivate/`, {
        method: "PATCH",
      })
      toast({ title: "Utilisateur désactivé", description: data.message || "Utilisateur désactivé avec succès" })
      setUsers((prev) => prev.map((u) => (u.uid === user.uid ? { ...u, ...data.user } : u)))
    } catch (err: any) {
      toast({ title: "Échec de la désactivation", description: extractErrorMessages(err) || "Impossible de désactiver l'utilisateur", variant: "destructive" })
    } finally {
      setDeactivatingUid(null)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUids(Array.from(new Set([...selectedUids, ...users.map((u) => u.uid)])))
    } else {
      setSelectedUids(selectedUids.filter((uid) => !users.map((u) => u.uid).includes(uid)))
    }
  }

  const handleSelectRow = (uid: string, checked: boolean) => {
    setSelectedUids((prev) => checked ? [...prev, uid] : prev.filter((id) => id !== uid))
  }

  // Bulk action handler
  const handleBulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedUids.length === 0) return
    setLoading(true)
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/bulk-action/`, {
        method: "POST",
        body: JSON.stringify({ action, user_ids: selectedUids }),
      })
      toast({ title: "Action en lot réussie", description: data.message || "Action en lot terminée" })
      setUsers((prev) => prev.map((u) => selectedUids.includes(u.uid) ? { ...u, ...data.user } : u))
      setSelectedUids([])
      setCurrentPage(1)
    } catch (err: any) {
      toast({ title: "Échec de l'action en lot", description: extractErrorMessages(err) || "Impossible d'effectuer l'action en lot", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Fetch user details
  const handleOpenDetail = async (uid: string) => {
    setDetailModalOpen(true)
    setDetailLoading(true)
    setDetailError("")
    setDetailUser(null)
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${uid}/`)
      setDetailUser(data)
      toast({ title: "Détails chargés", description: "Détails de l'utilisateur chargés avec succès" })
    } catch (err: any) {
      setDetailError(extractErrorMessages(err))
      toast({ title: "Échec du chargement des détails", description: extractErrorMessages(err), variant: "destructive" })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleCloseDetail = () => {
    setDetailModalOpen(false)
    setDetailUser(null)
    setDetailError("")
  }

  // Add handler for verifying email
  const handleVerifyEmail = async () => {
    if (!detailUser?.uid) return;
    setVerifyingEmail(true);
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${detailUser.uid}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_verified: true }),
      });
      setDetailUser((prev: any) => prev ? { ...prev, email_verified: true } : prev);
      toast({ title: "Email vérifié", description: "Email vérifié avec succès" });
    } catch (err: any) {
      toast({ title: "Échec de la vérification", description: extractErrorMessages(err), variant: "destructive" });
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Add handler for verifying phone
  const handleVerifyPhone = async () => {
    if (!detailUser?.uid) return;
    setVerifyingPhone(true);
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${detailUser.uid}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_verified: true }),
      });
      setDetailUser((prev: any) => prev ? { ...prev, phone_verified: true } : prev);
      toast({ title: "Téléphone vérifié", description: "Téléphone vérifié avec succès" });
    } catch (err: any) {
      toast({ title: "Échec de la vérification", description: extractErrorMessages(err), variant: "destructive" });
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Update handleVerifyEmail to handle both verify and unverify
  const handleToggleEmailVerified = async (verify: boolean) => {
    if (!detailUser?.uid) return;
    setVerifyingEmail(true);
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${detailUser.uid}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_verified: verify }),
      });
      setDetailUser((prev: any) => prev ? { ...prev, email_verified: verify } : prev);
      toast({ title: "Email vérifié", description: verify ? "Email vérifié avec succès" : "Email non vérifié avec succès" });
    } catch (err: any) {
      toast({ title: "Échec de la vérification", description: extractErrorMessages(err), variant: "destructive" });
    } finally {
      setVerifyingEmail(false);
    }
  };

  // Update handleVerifyPhone to handle both verify and unverify
  const handleTogglePhoneVerified = async (verify: boolean) => {
    if (!detailUser?.uid) return;
    setVerifyingPhone(true);
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${detailUser.uid}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_verified: verify }),
      });
      setDetailUser((prev: any) => prev ? { ...prev, phone_verified: verify } : prev);
      toast({ title: "Téléphone vérifié", description: verify ? "Téléphone vérifié avec succès" : "Téléphone non vérifié avec succès" });
    } catch (err: any) {
      toast({ title: "Échec de la vérification", description: extractErrorMessages(err), variant: "destructive" });
    } finally {
      setVerifyingPhone(false);
    }
  };

  // Add handler for toggling is_partner
  const handleTogglePartner = async (isPartner: boolean) => {
    if (!detailUser?.uid) return;
    setVerifyingPartner(true);
    try {
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${detailUser.uid}/update/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_partner: isPartner }),
      });
      setDetailUser((prev: any) => prev ? { ...prev, is_partner: isPartner } : prev);
      toast({ title: "Statut partenaire modifié", description: isPartner ? "Statut partenaire activé avec succès" : "Statut partenaire désactivé avec succès" });
    } catch (err: any) {
      toast({ title: "Échec de la modification du statut partenaire", description: extractErrorMessages(err), variant: "destructive" });
    } finally {
      setVerifyingPartner(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                {t("users.title") || "Utilisateurs"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gérer et surveiller les comptes utilisateurs
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {totalCount} utilisateurs
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                  placeholder="Rechercher des utilisateurs..."
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
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>

              {/* View Type */}
              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Type de vue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les utilisateurs</SelectItem>
                  <SelectItem value="pending">Utilisateurs en attente</SelectItem>
                </SelectContent>
              </Select>

          {/* Bulk Actions */}
              {someSelected && (
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {/* handle bulk activate */}}
                    className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Activer la sélection
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {/* handle bulk deactivate */}}
                    className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Désactiver la sélection
                </Button>
                </div>
              )}
          </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-300" />
              </div>
              <span>Liste des utilisateurs</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600 dark:text-gray-300">Chargement des utilisateurs...</span>
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
                      <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUids(users.map(u => u.uid));
                            } else {
                              setSelectedUids([]);
                            }
                          }}
                      />
                    </TableHead>
                      <TableHead className="font-semibold">Utilisateur</TableHead>
                      <TableHead className="font-semibold">Email</TableHead>
                      <TableHead className="font-semibold">Statut</TableHead>
                      <TableHead className="font-semibold">Vérification</TableHead>
                      <TableHead className="font-semibold">Créé le</TableHead>
                      <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedUids.includes(user.uid)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedUids([...selectedUids, user.uid]);
                              } else {
                                setSelectedUids(selectedUids.filter(id => id !== user.uid));
                              }
                            }}
                        />
                      </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {user.display_name || 'Sans nom'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                ID: {user.uid}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-900 dark:text-gray-100">
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              user.is_active 
                                ? "bg-green-100 text-white dark:bg-green-800/30 dark:text-green-300" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            }
                          >
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                      </TableCell>
                      <TableCell>
                          <div className="flex items-center space-x-2">
                            <Badge 
                            variant="outline"
                              className={
                                user.email_verified 
                                  ? "border-green-200 text-green-700 dark:border-green-700 dark:text-green-300" 
                                  : "border-red-200 text-red-700 dark:border-red-700 dark:text-red-300"
                              }
                            >
                              <Mail className="h-3 w-3 mr-1" />
                              {user.email_verified ? 'Vérifié' : 'Non vérifié'}
                            </Badge>
                            <Badge 
                            variant="outline"
                              className={
                                user.phone_verified 
                                  ? "border-green-200 text-green-700 dark:border-green-700 dark:text-green-300" 
                                  : "border-red-200 text-red-700 dark:border-red-700 dark:text-red-300"
                              }
                            >
                              <Phone className="h-3 w-3 mr-1" />
                              {user.phone_verified ? 'Vérifié' : 'Non vérifié'}
                            </Badge>
                          </div>
                      </TableCell>
                      <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {user.created_at}
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
                              <DropdownMenuItem onClick={() => handleOpenDetail(user.uid)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Voir les détails
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                if (user.is_active) {
                                  setConfirmActionUser(user);
                                  setConfirmActionType("deactivate");
                                } else {
                                  setConfirmActionUser(user);
                                  setConfirmActionType("activate");
                                }
                              }}>
                                {user.is_active ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Désactiver
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activer
                                  </>
                                )}
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
        {totalPages > 1 && (
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
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* User Details Modal */}
        <Dialog open={detailModalOpen} onOpenChange={(open) => { if (!open) handleCloseDetail() }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Détails de l'utilisateur</DialogTitle>
            </DialogHeader>
            {detailLoading ? (
              <div className="p-4 text-center">Chargement...</div>
            ) : detailError ? (
              <ErrorDisplay
                error={detailError}
                variant="inline"
                showRetry={false}
                className="mb-4"
              />
            ) : detailUser ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <b>UID:</b> {detailUser.uid}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => {
                      navigator.clipboard.writeText(detailUser.uid);
                      toast({ title: "UID copié!" });
                    }}
                    aria-label="Copier l'UID"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div><b>Nom:</b> {detailUser.display_name || `${detailUser.first_name || ""} ${detailUser.last_name || ""}`}</div>
                <div><b>Email:</b> {detailUser.email}</div>
                <div><b>Téléphone:</b> {detailUser.phone}</div>
                <div><b>Statut:</b> {detailUser.is_active ? 'Actif' : 'Inactif'}</div>
                <div><b>Email vérifié:</b> {detailUser.email_verified ? 'Oui' : 'Non'}
                  <Switch
                    checked={detailUser.email_verified}
                    disabled={detailLoading || verifyingEmail}
                    onCheckedChange={() => setConfirmEmailToggle(!detailUser.email_verified)}
                    className="ml-2"
                  />
                </div>
                <div><b>Téléphone vérifié:</b> {detailUser.phone_verified ? 'Oui' : 'Non'}
                  <Switch
                    checked={detailUser.phone_verified}
                    disabled={detailLoading || verifyingPhone}
                    onCheckedChange={() => setConfirmPhoneToggle(!detailUser.phone_verified)}
                    className="ml-2"
                  />
                </div>
                <div><b>Méthode de contact:</b> {detailUser.contact_method}</div>
                <div><b>Partenaire:</b> {detailUser.is_partner ? 'Oui' : 'Non'}
                  <Switch
                    checked={detailUser.is_partner}
                    disabled={detailLoading || verifyingPartner}
                    onCheckedChange={() => setConfirmPartnerToggle(!detailUser.is_partner)}
                    className="ml-2"
                  />
                </div>
                <div><b>Créé le:</b> {detailUser.created_at ? detailUser.created_at.split("T")[0] : "-"}</div>
                <div><b>Dernière connexion:</b> {detailUser.last_login_at ? detailUser.last_login_at.split("T")[0] : "-"}</div>
              </div>
            ) : null}
            <DialogClose asChild>
              <Button className="mt-4 w-full">Fermer</Button>
            </DialogClose>
          </DialogContent>
        </Dialog>

        {/* Email Verification Confirmation Modal */}
        <Dialog open={confirmEmailToggle !== null} onOpenChange={(open) => { if (!open) setConfirmEmailToggle(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmEmailToggle ? "Vérifier l'email" : "Ne pas vérifier l'email"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              {confirmEmailToggle
                ? "Êtes-vous sûr de vouloir vérifier l'email de cet utilisateur ?"
                : "Êtes-vous sûr de vouloir ne pas vérifier l'email de cet utilisateur ?"}
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={async () => {
                  await handleToggleEmailVerified(!!confirmEmailToggle);
                  setConfirmEmailToggle(null);
                }}
                disabled={verifyingEmail}
              >
                {verifyingEmail ? "Vérification..." : "OK"}
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setConfirmEmailToggle(null)}
                disabled={verifyingEmail}
              >
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Phone Verification Confirmation Modal */}
        <Dialog open={confirmPhoneToggle !== null} onOpenChange={(open) => { if (!open) setConfirmPhoneToggle(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmPhoneToggle ? "Vérifier le téléphone" : "Ne pas vérifier le téléphone"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              {confirmPhoneToggle
                ? "Êtes-vous sûr de vouloir vérifier le téléphone de cet utilisateur ?"
                : "Êtes-vous sûr de vouloir ne pas vérifier le téléphone de cet utilisateur ?"}
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={async () => {
                  await handleTogglePhoneVerified(!!confirmPhoneToggle);
                  setConfirmPhoneToggle(null);
                }}
                disabled={verifyingPhone}
              >
                {verifyingPhone ? "Vérification..." : "OK"}
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setConfirmPhoneToggle(null)}
                disabled={verifyingPhone}
              >
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Partner Toggle Confirmation Modal */}
        <Dialog open={confirmPartnerToggle !== null} onOpenChange={(open) => { if (!open) setConfirmPartnerToggle(null) }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmPartnerToggle ? "Activer le statut partenaire" : "Désactiver le statut partenaire"}</DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              {confirmPartnerToggle
                ? "Êtes-vous sûr de vouloir activer le statut partenaire ?"
                : "Êtes-vous sûr de vouloir désactiver le statut partenaire ?"}
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={async () => {
                  await handleTogglePartner(!!confirmPartnerToggle);
                  setConfirmPartnerToggle(null);
                }}
                disabled={verifyingPartner}
              >
                {verifyingPartner ? "Vérification..." : "OK"}
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => setConfirmPartnerToggle(null)}
                disabled={verifyingPartner}
              >
                Annuler
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Activate/Deactivate Confirmation Modal */}
        <Dialog open={!!confirmActionType} onOpenChange={(open) => { if (!open) { setConfirmActionType(null); setConfirmActionUser(null); } }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {confirmActionType === "activate"
                  ? "Activer l'utilisateur"
                  : "Désactiver l'utilisateur"}
              </DialogTitle>
            </DialogHeader>
            <div className="py-4 text-center">
              {confirmActionType === "activate"
                ? "Êtes-vous sûr de vouloir activer cet utilisateur ?"
                : "Êtes-vous sûr de vouloir désactiver cet utilisateur ?"}
            </div>
            <DialogFooter>
              <Button
                className="w-full"
                onClick={async () => {
                  if (confirmActionUser) {
                    if (confirmActionType === "activate") {
                      await handleActivate(confirmActionUser);
                    } else {
                      await handleDeactivate(confirmActionUser);
                    }
                  }
                  setConfirmActionType(null);
                  setConfirmActionUser(null);
                }}
                disabled={activatingUid === confirmActionUser?.uid || deactivatingUid === confirmActionUser?.uid}
              >
                {confirmActionType === "activate"
                  ? "Activer"
                  : "Désactiver"}
              </Button>
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => {
                  setConfirmActionType(null);
                  setConfirmActionUser(null);
                }}
                disabled={activatingUid === confirmActionUser?.uid || deactivatingUid === confirmActionUser?.uid}
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

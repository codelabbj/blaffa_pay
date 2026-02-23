"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, Plus, Filter, CheckCircle, XCircle, MoreHorizontal, User, Network, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/useApi"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface BulkDepositNetwork {
    uid: string
    user: string
    user_email: string | null
    user_phone: string
    network: string
    network_name: string
    is_active: boolean
    created_at: string
    updated_at: string
}

interface UserSummary {
    uid: string
    display_name: string
    email: string
    phone: string
}

interface NetworkSummary {
    uid: string
    name: string
}

export default function BulkDepositNetworksPage() {
    const { t } = useLanguage()
    const { toast } = useToast()
    const apiFetch = useApi()
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

    // State for the list
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState<BulkDepositNetwork[]>([])
    const [totalCount, setTotalCount] = useState(0)
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Filters
    const [userFilter, setUserFilter] = useState("")
    const [networkFilter, setNetworkFilter] = useState("")
    const [isActiveFilter, setIsActiveFilter] = useState("all")

    // Create Modal State
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [createLoading, setCreateLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState("")
    const [selectedNetwork, setSelectedNetwork] = useState("")
    const [userDropdownOpen, setUserDropdownOpen] = useState(false)
    const [networkDropdownOpen, setNetworkDropdownOpen] = useState(false)
    const [userSearchTerm, setUserSearchTerm] = useState("")

    // Data for Selects
    const [users, setUsers] = useState<UserSummary[]>([])
    const [networks, setNetworks] = useState<NetworkSummary[]>([])
    const [loadingUsers, setLoadingUsers] = useState(false)
    const [loadingNetworks, setLoadingNetworks] = useState(false)

    const fetchBulkNetworks = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: currentPage.toString(),
                page_size: itemsPerPage.toString(),
            })
            if (userFilter) params.append("user", userFilter)
            if (networkFilter) params.append("network", networkFilter)
            if (isActiveFilter !== "all") params.append("is_active", isActiveFilter)

            const response = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/admin/bulk-deposit-networks/?${params.toString()}`)
            setData(response.results || [])
            setTotalCount(response.count || 0)
        } catch (err) {
            toast({
                title: "Erreur",
                description: extractErrorMessages(err) || "Échec du chargement des réseaux de dépôt en masse",
                variant: "destructive",
            })
        } finally {
            setLoading(false)
        }
    }, [apiFetch, baseUrl, currentPage, userFilter, networkFilter, isActiveFilter, toast])

    useEffect(() => {
        fetchBulkNetworks()
    }, [fetchBulkNetworks])

    const fetchUsers = useCallback(async (search: string = "") => {
        setLoadingUsers(true)
        try {
            const params = new URLSearchParams({ page_size: "50" })
            if (search) params.append("search", search)
            const response = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/?${params.toString()}`)
            const usersData = response.results || response.users || []
            setUsers(usersData)
        } catch (err) {
            console.error("Failed to fetch users", err)
        } finally {
            setLoadingUsers(false)
        }
    }, [apiFetch, baseUrl])

    const [debounceSearchTerm, setDebounceSearchTerm] = useState("")

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebounceSearchTerm(userSearchTerm)
        }, 500)
        return () => clearTimeout(timer)
    }, [userSearchTerm])

    useEffect(() => {
        if (isCreateModalOpen) {
            fetchUsers(debounceSearchTerm)
        }
    }, [isCreateModalOpen, debounceSearchTerm, fetchUsers])

    const fetchNetworks = async () => {
        setLoadingNetworks(true)
        try {
            const response = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/`)
            // The API endpoint for networks might vary, let's assume it returns a list or results
            const networkData = response.results || response || []
            setNetworks(networkData.map((n: any) => ({
                uid: n.uid,
                name: n.nom || n.name
            })))
        } catch (err) {
            console.error("Failed to fetch networks", err)
        } finally {
            setLoadingNetworks(false)
        }
    }

    useEffect(() => {
        if (isCreateModalOpen) {
            fetchNetworks()
        }
    }, [isCreateModalOpen])

    const handleCreate = async () => {
        if (!selectedUser || !selectedNetwork) {
            toast({ title: "Erreur", description: "Veuillez sélectionner un utilisateur et un réseau", variant: "destructive" })
            return
        }

        setCreateLoading(true)
        try {
            await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/admin/bulk-deposit-networks/`, {
                method: "POST",
                body: JSON.stringify({
                    user: selectedUser,
                    network: selectedNetwork,
                }),
                successMessage: "Configuration de dépôt en masse créée avec succès",
            })
            setIsCreateModalOpen(false)
            setSelectedUser("")
            setSelectedNetwork("")
            fetchBulkNetworks()
        } catch (err) {
            toast({
                title: "Erreur",
                description: extractErrorMessages(err) || "Échec de la création",
                variant: "destructive",
            })
        } finally {
            setCreateLoading(false)
        }
    }

    const handleToggleStatus = async (uid: string, currentStatus: boolean) => {
        try {
            await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/admin/bulk-deposit-networks/${uid}/`, {
                method: "PATCH",
                body: JSON.stringify({ is_active: !currentStatus }),
                successMessage: `Statut mis à jour avec succès`,
            })
            fetchBulkNetworks()
        } catch (err) {
            toast({
                title: "Erreur",
                description: extractErrorMessages(err) || "Échec de la mise à jour du statut",
                variant: "destructive",
            })
        }
    }

    const totalPages = Math.ceil(totalCount / itemsPerPage)

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                            Autorisation Dépôts en Masse
                        </h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                            Gérer les autorisations des utilisateurs pour les dépôts en masse par réseau
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg transition-all duration-200"
                    >
                        <Plus className="mr-2 h-5 w-5" />
                        Nouvelle Autorisation
                    </Button>
                </div>

                {/* Filters */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="ID Utilisateur..."
                                    value={userFilter}
                                    onChange={(e) => setUserFilter(e.target.value)}
                                    className="pl-10 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                />
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="ID Réseau..."
                                    value={networkFilter}
                                    onChange={(e) => setNetworkFilter(e.target.value)}
                                    className="pl-10 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                />
                            </div>
                            <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
                                <SelectTrigger className="dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                                    <SelectValue placeholder="Filtrer par statut" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="true">Actif</SelectItem>
                                    <SelectItem value="false">Inactif</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => {
                                    setUserFilter("")
                                    setNetworkFilter("")
                                    setIsActiveFilter("all")
                                    setCurrentPage(1)
                                }}
                            >
                                Réinitialiser
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg overflow-hidden">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700 flex flex-row items-center justify-between">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                                <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            </div>
                            Liste des autorisations
                        </CardTitle>
                        <Badge variant="outline" className="text-gray-500">
                            {totalCount} total
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
                                <p className="text-gray-500">Chargement des données...</p>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="py-20 text-center">
                                <p className="text-gray-500 text-lg">Aucune autorisation trouvée</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
                                            <TableHead>Utilisateur</TableHead>
                                            <TableHead>Réseau</TableHead>
                                            <TableHead>Statut</TableHead>
                                            <TableHead>Date création</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.map((item) => (
                                            <TableRow key={item.uid} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/40 transition-colors">
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                            {item.user_phone}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-mono">
                                                            {item.user}
                                                        </span>
                                                        {item.user_email && (
                                                            <span className="text-xs text-blue-500">
                                                                {item.user_email}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{item.network_name}</span>
                                                        <span className="text-xs text-gray-500 font-mono">{item.network}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={
                                                            item.is_active
                                                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200"
                                                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200"
                                                        }
                                                    >
                                                        {item.is_active ? "Actif" : "Inactif"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-gray-500 text-sm">
                                                    {new Date(item.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem
                                                                onClick={() => handleToggleStatus(item.uid, item.is_active)}
                                                                className={item.is_active ? "text-red-600" : "text-green-600"}
                                                            >
                                                                {item.is_active ? (
                                                                    <><XCircle className="mr-2 h-4 w-4" /> Désactiver</>
                                                                ) : (
                                                                    <><CheckCircle className="mr-2 h-4 w-4" /> Activer</>
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
                    <div className="mt-6 flex items-center justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(p => p - 1)}
                        >
                            Précédent
                        </Button>
                        <span className="text-sm border rounded px-3 py-1 bg-white">
                            Page {currentPage} sur {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(p => p + 1)}
                        >
                            Suivant
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-orange-600">
                            Nouvelle Autorisation
                        </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="author-user">Utilisateur</Label>
                            <Popover open={userDropdownOpen} onOpenChange={setUserDropdownOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={userDropdownOpen}
                                        className="w-full justify-between font-normal dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                    >
                                        {selectedUser
                                            ? users.find((u) => u.uid === selectedUser)?.display_name || users.find((u) => u.uid === selectedUser)?.phone || selectedUser
                                            : "Rechercher un utilisateur..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Chercher par nom, email ou téléphone..."
                                            onValueChange={setUserSearchTerm}
                                        />
                                        <CommandList>
                                            <CommandEmpty>{loadingUsers ? "Chargement..." : "Aucun utilisateur trouvé."}</CommandEmpty>
                                            <CommandGroup>
                                                {users.map((u) => (
                                                    <CommandItem
                                                        key={u.uid}
                                                        value={u.uid}
                                                        onSelect={(currentValue) => {
                                                            setSelectedUser(currentValue === selectedUser ? "" : currentValue)
                                                            setUserDropdownOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedUser === u.uid ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span>{u.display_name || u.phone}</span>
                                                            <span className="text-xs text-muted-foreground">{u.email}</span>
                                                        </div>
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="author-network">Réseau</Label>
                            <Popover open={networkDropdownOpen} onOpenChange={setNetworkDropdownOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={networkDropdownOpen}
                                        className="w-full justify-between font-normal dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                                    >
                                        {selectedNetwork
                                            ? networks.find((n) => n.uid === selectedNetwork)?.name || selectedNetwork
                                            : "Sélectionner un réseau"}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command>
                                        <CommandInput placeholder="Rechercher un réseau..." />
                                        <CommandList>
                                            <CommandEmpty>Aucun réseau trouvé.</CommandEmpty>
                                            <CommandGroup>
                                                {networks.map((n) => (
                                                    <CommandItem
                                                        key={n.uid}
                                                        value={n.uid}
                                                        onSelect={(currentValue) => {
                                                            setSelectedNetwork(currentValue === selectedNetwork ? "" : currentValue)
                                                            setNetworkDropdownOpen(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedNetwork === n.uid ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {n.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <DialogClose asChild>
                            <Button variant="outline">Annuler</Button>
                        </DialogClose>
                        <Button
                            onClick={handleCreate}
                            disabled={createLoading || !selectedUser || !selectedNetwork}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            {createLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Créer l'autorisation
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

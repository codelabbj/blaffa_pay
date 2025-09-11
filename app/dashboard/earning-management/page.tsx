
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, DollarSign, TrendingUp, Users, Calendar, Filter, CheckCircle, XCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function EarningManagementPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [currentPage, setCurrentPage] = useState(1)
	const [earnings, setEarnings] = useState<any[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [sortField, setSortField] = useState<"amount" | "created_at" | "status" | null>(null)
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
	const { t } = useLanguage()
	const itemsPerPage = 10
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
	const { toast } = useToast()
	const apiFetch = useApi();
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [detailEarning, setDetailEarning] = useState<any | null>(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [detailError, setDetailError] = useState("")

	// Fetch earnings from API
	useEffect(() => {
		const fetchEarnings = async () => {
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
				const orderingParam = sortField
					? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
					: ""
				const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/admin/commission-payments/?${params.toString()}${orderingParam}`
				const data = await apiFetch(endpoint)
				setEarnings(data.results || [])
				setTotalCount(data.count || 0)
				setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
				toast({ title: t("earning.success"), description: t("earning.loadedSuccessfully") })
			} catch (err: any) {
				const errorMessage = extractErrorMessages(err)
				setError(errorMessage)
				setEarnings([])
				setTotalCount(0)
				setTotalPages(1)
				toast({ title: t("earning.failedToLoad"), description: errorMessage, variant: "destructive" })
			} finally {
				setLoading(false)
			}
		}
		fetchEarnings()
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, sortField, sortDirection, t, toast, apiFetch])

	const startIndex = (currentPage - 1) * itemsPerPage

	const handleSort = (field: "amount" | "created_at" | "status") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

	// Fetch earning details
	const handleOpenDetail = async (uid: string) => {
		setDetailModalOpen(true)
		setDetailLoading(true)
		setDetailError("")
		setDetailEarning(null)
		try {
			// For demo, just find in earnings
			const found = earnings.find((e) => e.uid === uid)
			setDetailEarning(found)
			toast({ title: t("earning.detailLoaded"), description: t("earning.detailLoadedSuccessfully") })
		} catch (err: any) {
			setDetailError(extractErrorMessages(err))
			toast({ title: t("earning.detailFailed"), description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setDetailLoading(false)
		}
	}

	// Calculate summary stats
	const totalEarnings = earnings.reduce((sum, earning) => sum + (parseFloat(earning.amount) || 0), 0)
	const pendingEarnings = earnings.filter(e => e.status === 'pending').reduce((sum, earning) => sum + (parseFloat(earning.amount) || 0), 0)
	const completedEarnings = earnings.filter(e => e.status === 'completed').reduce((sum, earning) => sum + (parseFloat(earning.amount) || 0), 0)

		return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				
				{/* Page Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								{t("earning.title") || "Earning Management"}
							</h1>
							<p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
								Surveiller et gérer les paiements de commission
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
								<div className="flex items-center space-x-2">
									<DollarSign className="h-5 w-5 text-green-600" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										{totalCount} paiements
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex items-center space-x-3">
								<div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
									<TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
								</div>
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Gains totaux</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
										{totalEarnings.toFixed(2)} FCFA
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex items-center space-x-3">
								<div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
									<Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
								</div>
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
										{pendingEarnings.toFixed(2)} FCFA
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex items-center space-x-3">
								<div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
									<CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-300" />
								</div>
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Terminé</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
										{completedEarnings.toFixed(2)} FCFA
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
									placeholder="Rechercher des gains..."
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
									<SelectItem value="pending">En attente</SelectItem>
									<SelectItem value="completed">Terminé</SelectItem>
									<SelectItem value="failed">Échec</SelectItem>
								</SelectContent>
							</Select>

							{/* Sort */}
							<Select 
								value={sortField || ""} 
								onValueChange={(value) => setSortField(value as "amount" | "created_at" | "status" | null)}
							>
								<SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
									<SelectValue placeholder="Trier par" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="amount">Montant</SelectItem>
									<SelectItem value="created_at">Date</SelectItem>
									<SelectItem value="status">Statut</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</CardContent>
				</Card>

				{/* Earnings Table */}
				<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
					<CardHeader className="border-b border-gray-100 dark:border-gray-700">
						<CardTitle className="flex items-center space-x-2">
							<div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
								<DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
							</div>
							<span>Liste des gains</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
							{loading ? (
							<div className="flex items-center justify-center py-12">
								<div className="flex flex-col items-center space-y-4">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
									<span className="text-gray-600 dark:text-gray-300">Chargement des gains...</span>
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
											<TableHead className="font-semibold">Utilisateur</TableHead>
											<TableHead className="font-semibold">Montant</TableHead>
											<TableHead className="font-semibold">Statut</TableHead>
											<TableHead className="font-semibold">Date</TableHead>
											<TableHead className="font-semibold">Actions</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{earnings.map((earning) => (
											<TableRow key={earning.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
												<TableCell>
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
															{earning.user_name?.charAt(0)?.toUpperCase() || 'U'}
														</div>
														<div>
															<div className="font-medium text-gray-900 dark:text-gray-100">
																{earning.user_name || 'Utilisateur inconnu'}
															</div>
															<div className="text-sm text-gray-500 dark:text-gray-400">
																{earning.user_id || earning.uid}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-1">
														{/* <DollarSign className="h-4 w-4 text-gray-400" /> */}
														<span className="font-medium text-gray-900 dark:text-gray-100">
															{parseFloat(earning.amount).toFixed(2)} FCFA
														</span>
													</div>
												</TableCell>
												<TableCell>
													<Badge 
														className={
															earning.status === 'completed'
																? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
																: earning.status === 'pending'
																? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
																: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
														}
													>
														<div className="flex items-center space-x-1">
															{earning.status === 'completed' ? (
																<CheckCircle className="h-3 w-3" />
															) : earning.status === 'pending' ? (
																<Clock className="h-3 w-3" />
															) : (
																<XCircle className="h-3 w-3" />
															)}
															<span>{earning.status}</span>
														</div>
													</Badge>
												</TableCell>
												<TableCell>
													<div className="text-sm text-gray-600 dark:text-gray-400">
														{earning.created_at 
															? new Date(earning.created_at).toLocaleString()
															: 'Inconnu'
														}
													</div>
												</TableCell>
													<TableCell>
													<Button 
														variant="outline" 
														size="sm"
														onClick={() => handleOpenDetail(earning.uid)}
													>
														Voir les détails
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

				{/* Empty State */}
				{!loading && !error && earnings.length === 0 && (
					<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
						<CardContent className="p-12 text-center">
							<DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
								Aucun gain trouvé
							</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-4">
								{searchTerm ? `Aucun gain ne correspond à "${searchTerm}"` : "Aucun gain n'a encore été enregistré."}
							</p>
					</CardContent>
				</Card>
				)}

				{/* Detail Modal */}
				<Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle className="flex items-center space-x-2">
								<DollarSign className="h-5 w-5 text-green-600" />
								<span>Détails du gain</span>
							</DialogTitle>
						</DialogHeader>
						{detailLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							</div>
						) : detailError ? (
							<ErrorDisplay error={detailError} />
						) : detailEarning ? (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Utilisateur</label>
										<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
											{detailEarning.user_name || 'Inconnu'}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Montant</label>
										<p className="text-lg font-semibold text-green-600">
											{parseFloat(detailEarning.amount).toFixed(2)} FCFA
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut</label>
										<Badge 
											className={
												detailEarning.status === 'completed'
													? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
													: detailEarning.status === 'pending'
													? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
													: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
											}
										>
											{detailEarning.status}
										</Badge>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Date</label>
										<p className="text-sm text-gray-900 dark:text-gray-100">
											{detailEarning.created_at 
												? new Date(detailEarning.created_at).toLocaleString()
												: 'Inconnu'
											}
										</p>
									</div>
								</div>
								{detailEarning.description && (
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
										<p className="text-sm text-gray-900 dark:text-gray-100">
											{detailEarning.description}
										</p>
								</div>
								)}
							</div>
						) : null}
					</DialogContent>
				</Dialog>

			</div>
		</div>
		)
}

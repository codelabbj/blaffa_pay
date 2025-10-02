
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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Users, Filter, CheckCircle, XCircle, Mail, Calendar, UserCheck, DollarSign, ArrowUpDown as ArrowUpDownIcon, Clock, Settings, TrendingUp, CreditCard } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

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

export default function PartnerPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
	const [startDate, setStartDate] = useState<string | null>(null)
	const [endDate, setEndDate] = useState<string | null>(null)
	const [currentPage, setCurrentPage] = useState(1)
	const [partners, setPartners] = useState<any[]>([])
	const [totalCount, setTotalCount] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [sortField, setSortField] = useState<"display_name" | "email" | "created_at" | null>(null)
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
	const { t } = useLanguage()
	const itemsPerPage = 20
	const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
	const { toast } = useToast()
	const apiFetch = useApi();
	const [detailModalOpen, setDetailModalOpen] = useState(false)
	const [detailPartner, setDetailPartner] = useState<any | null>(null)
	const [detailLoading, setDetailLoading] = useState(false)
	const [detailError, setDetailError] = useState("")
	const [transferModalOpen, setTransferModalOpen] = useState(false)
	const [transferPartner, setTransferPartner] = useState<any | null>(null)
	const [transferLoading, setTransferLoading] = useState(false)
	const [transferError, setTransferError] = useState("")
	const [partnerTransfers, setPartnerTransfers] = useState<any[]>([])
	
	// Betting Commission States
	const [bettingCommissionModalOpen, setBettingCommissionModalOpen] = useState(false)
	const [bettingCommissionPartner, setBettingCommissionPartner] = useState<any | null>(null)
	const [bettingCommissionConfig, setBettingCommissionConfig] = useState<any | null>(null)
	const [bettingCommissionLoading, setBettingCommissionLoading] = useState(false)
	const [bettingCommissionError, setBettingCommissionError] = useState("")
	const [bettingCommissionForm, setBettingCommissionForm] = useState({
		deposit_commission_rate: "",
		withdrawal_commission_rate: "",
	})
	const [bettingCommissionStats, setBettingCommissionStats] = useState<any | null>(null)
	const [bettingCommissionPaymentModalOpen, setBettingCommissionPaymentModalOpen] = useState(false)
	const [bettingCommissionPaymentForm, setBettingCommissionPaymentForm] = useState({
		admin_notes: "",
	})
	const [bettingCommissionPaymentLoading, setBettingCommissionPaymentLoading] = useState(false)
	const [bettingCommissionPaymentError, setBettingCommissionPaymentError] = useState("")

	// Fetch partners from API (authenticated)
	useEffect(() => {
		const fetchPartners = async () => {
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
					params.append("created_at__lte", endDate)
				}
				const orderingParam = sortField
					? `&ordering=${(sortDirection === "asc" ? "+" : "-")}${sortField}`
					: ""
				const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/partners/?${params.toString()}${orderingParam}`
				const data = await apiFetch(endpoint)
				setPartners(data.partners || [])
				setTotalCount(data.pagination?.total_count || 0)
				setTotalPages(data.pagination?.total_pages || 1)
				toast({ title: t("partners.success"), description: t("partners.loadedSuccessfully") })
			} catch (err: any) {
				const errorMessage = extractErrorMessages(err)
				setError(errorMessage)
				setPartners([])
				setTotalCount(0)
				setTotalPages(1)
				toast({ title: t("partners.failedToLoad"), description: errorMessage, variant: "destructive" })
			} finally {
				setLoading(false)
			}
		}
		fetchPartners()
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, sortField, sortDirection, startDate, endDate, t, toast, apiFetch])

	const startIndex = (currentPage - 1) * itemsPerPage

	const handleSort = (field: "display_name" | "email" | "created_at") => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc")
		} else {
			setSortField(field)
			setSortDirection("desc")
		}
	}

	// Fetch partner details (authenticated)
	const handleOpenDetail = async (uid: string) => {
		setDetailModalOpen(true)
		setDetailLoading(true)
		setDetailError("")
		setDetailPartner(null)
		try {
			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/partners/${uid}/`
			const data = await apiFetch(endpoint)
			setDetailPartner(data)
			toast({ title: t("partners.detailLoaded"), description: t("partners.detailLoadedSuccessfully") })
		} catch (err: any) {
			setDetailError(extractErrorMessages(err))
			toast({ title: t("partners.detailFailed"), description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setDetailLoading(false)
		}
	}

	// Fetch partner transfers (authenticated)
	const handleOpenTransfers = async (partner: any) => {
		setTransferModalOpen(true)
		setTransferLoading(true)
		setTransferError("")
		setTransferPartner(partner)
		setPartnerTransfers([])
		try {
			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/partner-transfers/by-partner/?partner_uid=${partner.uid}`
			const data = await apiFetch(endpoint)
			setPartnerTransfers(data.results || [])
			toast({ title: "Succès", description: "Transferts du partenaire chargés avec succès" })
		} catch (err: any) {
			setTransferError(extractErrorMessages(err))
			toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setTransferLoading(false)
		}
	}

	// Fetch betting commission config for partner
	const handleOpenBettingCommission = async (partner: any) => {
		setBettingCommissionModalOpen(true)
		setBettingCommissionLoading(true)
		setBettingCommissionError("")
		setBettingCommissionPartner(partner)
		setBettingCommissionConfig(null)
		setBettingCommissionStats(null)
		
		try {
			// Get partner commission config
			const configEndpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commission-configs/get_partner_config/?partner_uid=${partner.uid}`
			const configData = await apiFetch(configEndpoint)
			
			if (configData.success && configData.has_config) {
				setBettingCommissionConfig(configData.config)
				setBettingCommissionForm({
					deposit_commission_rate: configData.config.deposit_commission_rate,
					withdrawal_commission_rate: configData.config.withdrawal_commission_rate,
				})
			} else {
				setBettingCommissionForm({
					deposit_commission_rate: "2.00",
					withdrawal_commission_rate: "3.00",
				})
			}
			
			// Get global stats
			const statsEndpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commissions/global_stats/`
			const statsData = await apiFetch(statsEndpoint)
			setBettingCommissionStats(statsData)
			
			toast({ title: "Succès", description: "Configuration des commissions de paris chargée" })
		} catch (err: any) {
			setBettingCommissionError(extractErrorMessages(err))
			toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setBettingCommissionLoading(false)
		}
	}

	// Save betting commission config
	const handleSaveBettingCommission = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!bettingCommissionPartner) return

		setBettingCommissionLoading(true)
		setBettingCommissionError("")
		
		try {
			const payload = {
				partner: bettingCommissionPartner.uid,
				deposit_commission_rate: bettingCommissionForm.deposit_commission_rate,
				withdrawal_commission_rate: bettingCommissionForm.withdrawal_commission_rate,
			}

			let endpoint, method
			if (bettingCommissionConfig) {
				// Update existing config
				endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commission-configs/${bettingCommissionConfig.uid}/`
				method = "PATCH"
			} else {
				// Create new config
				endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commission-configs/`
				method = "POST"
			}

			const data = await apiFetch(endpoint, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})

			setBettingCommissionConfig(data)
			toast({ 
				title: "Succès", 
				description: "Configuration des commissions de paris sauvegardée" 
			})
		} catch (err: any) {
			setBettingCommissionError(extractErrorMessages(err))
			toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setBettingCommissionLoading(false)
		}
	}

	// Pay betting commission
	const handlePayBettingCommission = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!bettingCommissionPartner) return

		setBettingCommissionPaymentLoading(true)
		setBettingCommissionPaymentError("")
		
		try {
			const payload = {
				partner_uid: bettingCommissionPartner.uid,
				transaction_ids: null,
				admin_notes: bettingCommissionPaymentForm.admin_notes,
			}

			const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commissions/pay_commissions/`
			const data = await apiFetch(endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})

			toast({ 
				title: "Succès", 
				description: data.message || "Commission de paris payée avec succès" 
			})
			
			setBettingCommissionPaymentModalOpen(false)
			setBettingCommissionPaymentForm({ admin_notes: "" })
			
			// Refresh stats
			const statsEndpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/commissions/global_stats/`
			const statsData = await apiFetch(statsEndpoint)
			setBettingCommissionStats(statsData)
		} catch (err: any) {
			setBettingCommissionPaymentError(extractErrorMessages(err))
			toast({ title: "Erreur", description: extractErrorMessages(err), variant: "destructive" })
		} finally {
			setBettingCommissionPaymentLoading(false)
		}
	}

	// Calculate summary stats
	const activePartners = partners.filter(p => p.is_active).length
	const totalCommission = partners.reduce((sum, partner) => sum + (parseFloat(partner.total_commission) || 0), 0)

	return (
		<div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				
				{/* Page Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
								{t("partners.title") || "Partner Management"}
							</h1>
							<p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
												Gérer les comptes partenaires et le suivi des commissions
											</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
								<div className="flex items-center space-x-2">
									<Users className="h-5 w-5 text-orange-500" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
																						{totalCount} partenaires
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Summary Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
					<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex items-center space-x-3">
								<div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
									<UserCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
								</div>
								<div>
																					<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Partenaires actifs</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
										{activePartners}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
						<CardContent className="p-6">
							<div className="flex items-center space-x-3">
								<div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
									<Copy className="h-6 w-6 text-orange-600 dark:text-orange-300" />
								</div>
								<div>
																					<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission totale</p>
									<p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
										${totalCommission.toFixed(2)}
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
														placeholder="Rechercher des partenaires..."
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
																							<SelectItem value="all">Tous les partenaires</SelectItem>
														<SelectItem value="active">Actif</SelectItem>
														<SelectItem value="inactive">Inactif</SelectItem>
								</SelectContent>
							</Select>

							{/* Sort */}
							<Select 
								value={sortField || ""} 
								onValueChange={(value) => setSortField(value as "display_name" | "email" | "created_at" | null)}
							>
								<SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
																							<SelectValue placeholder="Trier par" />
							</SelectTrigger>
							<SelectContent>
																							<SelectItem value="display_name">Nom</SelectItem>
														<SelectItem value="email">E-mail</SelectItem>
														<SelectItem value="created_at">Date</SelectItem>
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

				{/* Partners Table */}
				<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
					<CardHeader className="border-b border-gray-100 dark:border-gray-700">
						<CardTitle className="flex items-center space-x-2">
							<div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
								<Users className="h-5 w-5 text-orange-600 dark:text-orange-300" />
							</div>
																				<span>Liste des partenaires</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{loading ? (
							<div className="flex items-center justify-center py-12">
								<div className="flex flex-col items-center space-y-4">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
									<span className="text-gray-600 dark:text-gray-300">Chargement des partenaires...</span>
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
										<TableHead className="font-semibold">E-mail</TableHead>
										<TableHead className="font-semibold">Statut</TableHead>
										<TableHead className="font-semibold">USSD</TableHead>
										<TableHead className="font-semibold">Commission</TableHead>
										<TableHead className="font-semibold">Rejoint</TableHead>
										<TableHead className="font-semibold">Actions</TableHead>
								</TableRow>
								</TableHeader>
								<TableBody>
									{partners.map((partner) => (
											<TableRow key={partner.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
												<TableCell>
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
															{partner.display_name?.charAt(0)?.toUpperCase() || 'P'}
														</div>
														<div>
															<div className="font-medium text-gray-900 dark:text-gray-100">
																{partner.display_name || 'Partenaire inconnu'}
															</div>
															<div className="text-sm text-gray-500 dark:text-gray-400">
																{partner.phone_number || 'Aucun téléphone'}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Mail className="h-4 w-4 text-gray-400" />
														<span className="text-sm text-gray-700 dark:text-gray-300">
															{partner.email || 'Aucun e-mail'}
														</span>
													</div>
												</TableCell>
											<TableCell>
													<Badge 
														className={
															partner.is_active 
																? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
																: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
														}
													>
														<div className="flex items-center space-x-1">
															{partner.is_active ? (
																<CheckCircle className="h-3 w-3" />
															) : (
																<XCircle className="h-3 w-3" />
															)}
															<span>{partner.is_active ? 'Actif' : 'Inactif'}</span>
														</div>
													</Badge>
												</TableCell>
												<TableCell>
													<Badge 
														className={
															partner.can_process_ussd_transaction 
																? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
																: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300"
														}
													>
														<div className="flex items-center space-x-1">
															{partner.can_process_ussd_transaction ? (
																<CheckCircle className="h-3 w-3" />
															) : (
																<XCircle className="h-3 w-3" />
															)}
															<span>{partner.can_process_ussd_transaction ? 'Oui' : 'Non'}</span>
														</div>
													</Badge>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-1">
														<Copy className="h-4 w-4 text-gray-400" />
														<span className="font-medium text-gray-900 dark:text-gray-100">
															${parseFloat(partner.total_commission || 0).toFixed(2)}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Calendar className="h-4 w-4 text-gray-400" />
														<span className="text-sm text-gray-600 dark:text-gray-400">
															{partner.created_at 
																? new Date(partner.created_at).toLocaleDateString()
																: 'Inconnu'
															}
														</span>
													</div>
											</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Link href={`/dashboard/partner/commission/${partner.uid}`}>
															<Button 
																variant="outline" 
																size="sm"
																className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/30"
															>
																<DollarSign className="h-4 w-4 mr-1" />
																Commission
															</Button>
														</Link>
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleOpenBettingCommission(partner)}
															className="bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900/30"
														>
															<TrendingUp className="h-4 w-4 mr-1" />
															Commissions Paris
														</Button>
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleOpenTransfers(partner)}
															className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700 dark:hover:bg-blue-900/30"
														>
															<ArrowUpDownIcon className="h-4 w-4 mr-1" />
															Transferts
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
				{!loading && !error && partners.length === 0 && (
					<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
						<CardContent className="p-12 text-center">
							<Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
							<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
								Aucun partenaire trouvé
							</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-4">
								{searchTerm ? `Aucun partenaire ne correspond à "${searchTerm}"` : "Aucun partenaire n'a encore été enregistré."}
							</p>
				</CardContent>
			</Card>
				)}

				{/* Detail Modal */}
				<Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
					<DialogContent className="max-w-2xl">
					<DialogHeader>
							<DialogTitle className="flex items-center space-x-2">
								<Users className="h-5 w-5 text-purple-600" />
								<span>Détails du partenaire</span>
							</DialogTitle>
					</DialogHeader>
					{detailLoading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
							</div>
					) : detailError ? (
							<ErrorDisplay error={detailError} />
					) : detailPartner ? (
							<div className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom</label>
										<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
											{detailPartner.display_name || 'Inconnu'}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">E-mail</label>
										<p className="text-sm text-gray-900 dark:text-gray-100">
											{detailPartner.email || 'Aucun e-mail'}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Téléphone</label>
										<p className="text-sm text-gray-900 dark:text-gray-100">
											{detailPartner.phone_number || 'Aucun téléphone'}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut</label>
										<Badge 
											className={
												detailPartner.is_active
													? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
													: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
											}
										>
											{detailPartner.is_active ? 'Actif' : 'Inactif'}
										</Badge>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Commission totale</label>
										<p className="text-lg font-semibold text-green-600">
											${parseFloat(detailPartner.total_commission || 0).toFixed(2)}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejoint</label>
										<p className="text-sm text-gray-900 dark:text-gray-100">
											{detailPartner.created_at 
												? new Date(detailPartner.created_at).toLocaleString()
												: 'Inconnu'
											}
										</p>
									</div>
							</div>
						</div>
					) : null}
				</DialogContent>
			</Dialog>

			{/* Transfer Modal */}
			<Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
				<DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center space-x-2">
							<ArrowUpDownIcon className="h-5 w-5 text-blue-600" />
							<span>Transferts de {transferPartner?.display_name || 'Partenaire'}</span>
						</DialogTitle>
					</DialogHeader>
					{transferLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
						</div>
					) : transferError ? (
						<ErrorDisplay error={transferError} />
					) : (
						<div className="space-y-4">
							{partnerTransfers.length === 0 ? (
								<div className="text-center py-8">
									<ArrowUpDownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
									<h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
										Aucun transfert trouvé
									</h3>
									<p className="text-gray-500 dark:text-gray-400">
										Ce partenaire n'a effectué aucun transfert.
									</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<Table>
										<TableHeader>
											<TableRow className="bg-gray-50 dark:bg-gray-900/50">
												<TableHead className="font-semibold">Référence</TableHead>
												<TableHead className="font-semibold">Type</TableHead>
												<TableHead className="font-semibold">Contrepartie</TableHead>
												<TableHead className="font-semibold">Montant</TableHead>
												<TableHead className="font-semibold">Statut</TableHead>
												<TableHead className="font-semibold">Date</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{partnerTransfers.map((transfer) => (
												<TableRow key={transfer.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
													<TableCell>
														<div className="flex items-center space-x-2">
															<Copy className="h-4 w-4 text-gray-400" />
															<span className="text-sm font-mono text-gray-700 dark:text-gray-300">
																{transfer.reference}
															</span>
														</div>
													</TableCell>
													<TableCell>
														<Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
															{transfer.sender === transferPartner?.id ? 'Envoi' : 'Réception'}
														</Badge>
													</TableCell>
													<TableCell>
														<div className="flex items-center space-x-3">
															<div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
																{(transfer.sender === transferPartner?.id ? transfer.receiver_name : transfer.sender_name)?.charAt(0)?.toUpperCase() || 'U'}
															</div>
															<div>
																<div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
																	{transfer.sender === transferPartner?.id ? transfer.receiver_name : transfer.sender_name}
																</div>
																<div className="text-xs text-gray-500 dark:text-gray-400">
																	{transfer.sender === transferPartner?.id ? transfer.receiver_email : transfer.sender_email}
																</div>
															</div>
														</div>
													</TableCell>
													<TableCell>
														<div className="flex items-center space-x-1">
															<DollarSign className="h-4 w-4 text-gray-400" />
															<span className={`font-medium ${transfer.sender === transferPartner?.id ? 'text-red-600' : 'text-green-600'}`}>
																{transfer.sender === transferPartner?.id ? '-' : '+'}{parseFloat(transfer.amount).toFixed(2)} FCFA
															</span>
														</div>
													</TableCell>
													<TableCell>
														{transfer.status === 'completed' ? (
															<Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
																<div className="flex items-center space-x-1">
																	<CheckCircle className="h-3 w-3" />
																	<span>Terminé</span>
																</div>
															</Badge>
														) : transfer.status === 'pending' ? (
															<Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
																<div className="flex items-center space-x-1">
																	<Clock className="h-3 w-3" />
																	<span>En attente</span>
																</div>
															</Badge>
														) : (
															<Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
																<div className="flex items-center space-x-1">
																	<XCircle className="h-3 w-3" />
																	<span>Échec</span>
																</div>
															</Badge>
														)}
													</TableCell>
													<TableCell>
														<div className="flex items-center space-x-2">
															<Calendar className="h-4 w-4 text-gray-400" />
															<span className="text-sm text-gray-600 dark:text-gray-400">
																{transfer.created_at 
																	? new Date(transfer.created_at).toLocaleDateString()
																	: 'Inconnu'
																}
															</span>
														</div>
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Betting Commission Modal */}
			<Dialog open={bettingCommissionModalOpen} onOpenChange={setBettingCommissionModalOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center space-x-2">
							<TrendingUp className="h-5 w-5 text-orange-600" />
							<span>Commissions de Paris - {bettingCommissionPartner?.display_name || 'Partenaire'}</span>
						</DialogTitle>
					</DialogHeader>
					{bettingCommissionLoading ? (
						<div className="flex items-center justify-center py-8">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
						</div>
					) : bettingCommissionError ? (
						<ErrorDisplay error={bettingCommissionError} />
					) : (
						<div className="space-y-6">
							{/* Global Stats */}
							{bettingCommissionStats && (
								<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
									<Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
										<CardContent className="p-4">
											<div className="flex items-center space-x-2">
												<DollarSign className="h-5 w-5 text-blue-600" />
												<div>
													<p className="text-sm font-medium text-blue-800 dark:text-blue-300">Total Transactions</p>
													<p className="text-lg font-bold text-blue-600">{bettingCommissionStats.total_transactions}</p>
												</div>
											</div>
										</CardContent>
									</Card>
									<Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
										<CardContent className="p-4">
											<div className="flex items-center space-x-2">
												<TrendingUp className="h-5 w-5 text-green-600" />
												<div>
													<p className="text-sm font-medium text-green-800 dark:text-green-300">Total Commission</p>
													<p className="text-lg font-bold text-green-600">{parseFloat(bettingCommissionStats.total_commission || 0).toFixed(2)} FCFA</p>
												</div>
											</div>
										</CardContent>
									</Card>
									<Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
										<CardContent className="p-4">
											<div className="flex items-center space-x-2">
												<CheckCircle className="h-5 w-5 text-orange-600" />
												<div>
													<p className="text-sm font-medium text-orange-800 dark:text-orange-300">Commission Payée</p>
													<p className="text-lg font-bold text-orange-600">{parseFloat(bettingCommissionStats.paid_commission || 0).toFixed(2)} FCFA</p>
												</div>
											</div>
										</CardContent>
									</Card>
									<Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
										<CardContent className="p-4">
											<div className="flex items-center space-x-2">
												<Clock className="h-5 w-5 text-red-600" />
												<div>
													<p className="text-sm font-medium text-red-800 dark:text-red-300">Commission Impayée</p>
													<p className="text-lg font-bold text-red-600">{parseFloat(bettingCommissionStats.unpaid_commission || 0).toFixed(2)} FCFA</p>
												</div>
											</div>
										</CardContent>
									</Card>
								</div>
							)}

							{/* Commission Configuration Form */}
							<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
								<CardHeader>
									<CardTitle className="flex items-center space-x-2">
										<Settings className="h-5 w-5 text-orange-600" />
										<span>Configuration des Commissions</span>
									</CardTitle>
								</CardHeader>
								<CardContent>
									<form onSubmit={handleSaveBettingCommission} className="space-y-4">
										{bettingCommissionError && (
											<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
												<ErrorDisplay error={bettingCommissionError} />
											</div>
										)}

										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<Label htmlFor="deposit_commission_rate">Taux de Commission Dépôt (%)</Label>
												<Input
													id="deposit_commission_rate"
													type="number"
													step="0.01"
													min="0"
													max="100"
													value={bettingCommissionForm.deposit_commission_rate}
													onChange={(e) => setBettingCommissionForm(prev => ({ ...prev, deposit_commission_rate: e.target.value }))}
													className="mt-1"
													required
												/>
											</div>
											<div>
												<Label htmlFor="withdrawal_commission_rate">Taux de Commission Retrait (%)</Label>
												<Input
													id="withdrawal_commission_rate"
													type="number"
													step="0.01"
													min="0"
													max="100"
													value={bettingCommissionForm.withdrawal_commission_rate}
													onChange={(e) => setBettingCommissionForm(prev => ({ ...prev, withdrawal_commission_rate: e.target.value }))}
													className="mt-1"
													required
												/>
											</div>
										</div>

										<div className="flex items-center space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
											<Button
												type="submit"
												disabled={bettingCommissionLoading}
												className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
											>
												{bettingCommissionLoading ? (
													<>
														<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
														Sauvegarde...
													</>
												) : (
													<>
														<Settings className="h-4 w-4 mr-2" />
														{bettingCommissionConfig ? 'Mettre à jour' : 'Créer'} Configuration
													</>
												)}
											</Button>
											<Button
												type="button"
												variant="outline"
												onClick={() => setBettingCommissionPaymentModalOpen(true)}
												disabled={bettingCommissionLoading}
												className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-300 dark:border-green-700 dark:hover:bg-green-900/30"
											>
												<CreditCard className="h-4 w-4 mr-2" />
												Payer Commission
											</Button>
										</div>
									</form>
								</CardContent>
							</Card>

							{/* Current Configuration Display */}
							{bettingCommissionConfig && (
								<Card className="bg-gray-50 dark:bg-gray-700 border-0 shadow-lg">
									<CardHeader>
										<CardTitle className="flex items-center space-x-2">
											<CheckCircle className="h-5 w-5 text-green-600" />
											<span>Configuration Actuelle</span>
										</CardTitle>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de Commission Dépôt:</span>
												<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
													{bettingCommissionConfig.deposit_commission_rate}%
												</p>
											</div>
											<div>
												<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux de Commission Retrait:</span>
												<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
													{bettingCommissionConfig.withdrawal_commission_rate}%
												</p>
											</div>
											<div>
												<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Mis à jour par:</span>
												<p className="text-sm text-gray-900 dark:text-gray-100">
													{bettingCommissionConfig.updated_by_name}
												</p>
											</div>
											<div>
												<span className="text-sm font-medium text-gray-600 dark:text-gray-400">Dernière mise à jour:</span>
												<p className="text-sm text-gray-900 dark:text-gray-100">
													{bettingCommissionConfig.updated_at 
														? new Date(bettingCommissionConfig.updated_at).toLocaleString()
														: 'Non disponible'
													}
												</p>
											</div>
										</div>
									</CardContent>
								</Card>
							)}
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Betting Commission Payment Modal */}
			<Dialog open={bettingCommissionPaymentModalOpen} onOpenChange={setBettingCommissionPaymentModalOpen}>
				<DialogContent className="max-w-2xl">
					<DialogHeader>
						<DialogTitle className="flex items-center space-x-2">
							<CreditCard className="h-5 w-5 text-green-600" />
							<span>Payer Commission de Paris</span>
						</DialogTitle>
					</DialogHeader>
					<form onSubmit={handlePayBettingCommission} className="space-y-6">
						{bettingCommissionPaymentError && (
							<div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
								<ErrorDisplay error={bettingCommissionPaymentError} />
							</div>
						)}

						<div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
							<h3 className="font-medium text-orange-800 dark:text-orange-300 mb-2">
								Partennaire: {bettingCommissionPartner?.display_name}
							</h3>
							<p className="text-sm text-orange-700 dark:text-orange-400">
								Cette action va payer toutes les commissions impayées pour ce partenaire.
							</p>
						</div>

						<div>
							<Label htmlFor="admin_notes">Notes Administrateur</Label>
							<Textarea
								id="admin_notes"
								placeholder="Ajouter des notes pour ce paiement de commission..."
								value={bettingCommissionPaymentForm.admin_notes}
								onChange={(e) => setBettingCommissionPaymentForm(prev => ({ ...prev, admin_notes: e.target.value }))}
								className="mt-1"
								rows={3}
							/>
						</div>

						<div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
							<Button
								type="submit"
								disabled={bettingCommissionPaymentLoading}
								className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
							>
								{bettingCommissionPaymentLoading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										Paiement...
									</>
								) : (
									<>
										<CreditCard className="h-4 w-4 mr-2" />
										Payer Commission
									</>
								)}
							</Button>
							<Button
								type="button"
								variant="outline"
								onClick={() => setBettingCommissionPaymentModalOpen(false)}
								disabled={bettingCommissionPaymentLoading}
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

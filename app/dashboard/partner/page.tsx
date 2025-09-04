
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
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Copy, Users, Filter, CheckCircle, XCircle, Mail, Calendar, UserCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

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

export default function PartnerPage() {
	const [searchTerm, setSearchTerm] = useState("")
	const [statusFilter, setStatusFilter] = useState("all")
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
	}, [searchTerm, currentPage, itemsPerPage, baseUrl, statusFilter, sortField, sortDirection, t, toast, apiFetch])

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

	// Calculate summary stats
	const activePartners = partners.filter(p => p.is_active).length
	const totalCommission = partners.reduce((sum, partner) => sum + (parseFloat(partner.total_commission) || 0), 0)

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				
				{/* Page Header */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						<div>
							<h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
								{t("partners.title") || "Partner Management"}
							</h1>
							<p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
								Manage partner accounts and commission tracking
							</p>
						</div>
						<div className="flex items-center space-x-4">
							<div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
								<div className="flex items-center space-x-2">
									<Users className="h-5 w-5 text-blue-600" />
									<span className="text-sm font-medium text-gray-700 dark:text-gray-300">
										{totalCount} partners
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
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Partners</p>
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
								<div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
									<Copy className="h-6 w-6 text-blue-600 dark:text-blue-300" />
								</div>
								<div>
									<p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</p>
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
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
							<Input
									placeholder="Search partners..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
							/>
						</div>

							{/* Status Filter */}
						<Select value={statusFilter} onValueChange={setStatusFilter}>
								<SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Partners</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="inactive">Inactive</SelectItem>
								</SelectContent>
							</Select>

							{/* Sort */}
							<Select 
								value={sortField || ""} 
								onValueChange={(value) => setSortField(value as "display_name" | "email" | "created_at" | null)}
							>
								<SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
									<SelectValue placeholder="Sort by" />
							</SelectTrigger>
							<SelectContent>
									<SelectItem value="display_name">Name</SelectItem>
									<SelectItem value="email">Email</SelectItem>
									<SelectItem value="created_at">Date</SelectItem>
							</SelectContent>
						</Select>
					</div>
					</CardContent>
				</Card>

				{/* Partners Table */}
				<Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
					<CardHeader className="border-b border-gray-100 dark:border-gray-700">
						<CardTitle className="flex items-center space-x-2">
							<div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
								<Users className="h-5 w-5 text-purple-600 dark:text-purple-300" />
							</div>
							<span>Partners List</span>
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						{loading ? (
							<div className="flex items-center justify-center py-12">
								<div className="flex flex-col items-center space-y-4">
									<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
									<span className="text-gray-600 dark:text-gray-300">Loading partners...</span>
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
											<TableHead className="font-semibold">Partner</TableHead>
											<TableHead className="font-semibold">Email</TableHead>
											<TableHead className="font-semibold">Status</TableHead>
											<TableHead className="font-semibold">Commission</TableHead>
											<TableHead className="font-semibold">Joined</TableHead>
											<TableHead className="font-semibold">Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{partners.map((partner) => (
											<TableRow key={partner.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
												<TableCell>
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-semibold">
															{partner.display_name?.charAt(0)?.toUpperCase() || 'P'}
														</div>
														<div>
															<div className="font-medium text-gray-900 dark:text-gray-100">
																{partner.display_name || 'Unknown Partner'}
															</div>
															<div className="text-sm text-gray-500 dark:text-gray-400">
																{partner.phone_number || 'No phone'}
															</div>
														</div>
													</div>
												</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Mail className="h-4 w-4 text-gray-400" />
														<span className="text-sm text-gray-700 dark:text-gray-300">
															{partner.email || 'No email'}
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
															<span>{partner.is_active ? 'Active' : 'Inactive'}</span>
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
																: 'Unknown'
															}
														</span>
													</div>
											</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Button 
															variant="outline" 
															size="sm"
															onClick={() => handleOpenDetail(partner.uid)}
														>
															View Details
												</Button>
														<Button 
															variant="outline" 
															size="sm"
															className={
																partner.is_active 
																	? "text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20" 
																	: "text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20"
															}
														>
															{partner.is_active ? 'Deactivate' : 'Activate'}
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
							Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalCount)} of {totalCount} results
						</div>
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
								disabled={currentPage === 1}
							>
								<ChevronLeft className="h-4 w-4" />
								Previous
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
								Next
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
								No partners found
							</h3>
							<p className="text-gray-500 dark:text-gray-400 mb-4">
								{searchTerm ? `No partners match "${searchTerm}"` : "No partners have been registered yet."}
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
								<span>Partner Details</span>
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
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
										<p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
											{detailPartner.display_name || 'Unknown'}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
										<p className="text-sm text-gray-900 dark:text-gray-100">
											{detailPartner.email || 'No email'}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
										<p className="text-sm text-gray-900 dark:text-gray-100">
											{detailPartner.phone_number || 'No phone'}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</label>
										<Badge 
											className={
												detailPartner.is_active
													? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
													: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
											}
										>
											{detailPartner.is_active ? 'Active' : 'Inactive'}
										</Badge>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commission</label>
										<p className="text-lg font-semibold text-green-600">
											${parseFloat(detailPartner.total_commission || 0).toFixed(2)}
										</p>
									</div>
									<div>
										<label className="text-sm font-medium text-gray-600 dark:text-gray-400">Joined</label>
										<p className="text-sm text-gray-900 dark:text-gray-100">
											{detailPartner.created_at 
												? new Date(detailPartner.created_at).toLocaleString()
												: 'Unknown'
											}
										</p>
									</div>
							</div>
						</div>
					) : null}
				</DialogContent>
			</Dialog>

			</div>
		</div>
	)
}

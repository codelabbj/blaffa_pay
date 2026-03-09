"use client"

import { useState, useEffect, useCallback } from "react"
import { useAggregatorApi, AggregatorUser } from "@/lib/aggregator-api"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Search,
    Loader,
    RefreshCw,
    UserCheck,
    UserX,
    Eye,
    MoreHorizontal,
    Mail,
    Phone,
    Shield
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/useApi"
import { cn } from "@/lib/utils"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function AggregatorUsersPage() {
    const { t } = useLanguage()
    const { getAggregatorUsers } = useAggregatorApi()
    const apiFetch = useApi()
    const { toast } = useToast()

    const [users, setUsers] = useState<AggregatorUser[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [togglingUid, setTogglingUid] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [ordering, setOrdering] = useState("-created_at")
    const [pagination, setPagination] = useState({
        total_pages: 1,
        total_count: 0,
        has_next: false,
        has_previous: false
    })

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            params.append("page", page.toString())
            params.append("ordering", ordering)
            const data = await getAggregatorUsers(params)
            setUsers(data.results || data.users || [])
            if (data.pagination) {
                setPagination(data.pagination)
            }
        } catch (err: any) {
            setError(err.message || t("aggregator.failedToLoadUsers"))
        } finally {
            setLoading(false)
        }
    }, [getAggregatorUsers, page, ordering, t])

    useEffect(() => {
        fetchUsers()
    }, [fetchUsers])

    const filteredUsers = users.filter(user =>
        user.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleToggleStatus = async (user: AggregatorUser) => {
        setTogglingUid(user.uid)
        const action = user.is_active ? "deactivate" : "activate"
        try {
            await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/admin/users/${user.uid}/${action}/`, {
                method: "PATCH",
            })
            toast({
                title: t("aggregator.statusUpdated"),
                description: t(user.is_active ? "aggregator.userDeactivated" : "aggregator.userActivated").replace("{name}", user.display_name),
            })
            setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, is_active: !u.is_active } : u))
        } catch (err: any) {
            toast({
                title: t("aggregator.actionFailed"),
                description: err.message || t("common.errorOccurred"),
                variant: "destructive",
            })
        } finally {
            setTogglingUid(null)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                        {t("nav.aggregatorUsers")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {t("aggregator.manageAggregatorAccounts")}
                    </p>
                </div>
                <Button onClick={fetchUsers} variant="outline" className="border-orange-200">
                    <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                    {t("common.refresh")}
                </Button>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full sm:max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder={t("users.search")}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-gray-50 dark:bg-gray-800"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500 whitespace-nowrap">{t("common.sortBy")}:</span>
                            <Select value={ordering} onValueChange={setOrdering}>
                                <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-gray-800">
                                    <SelectValue placeholder={t("common.sort")} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="-created_at">{t("common.newest")}</SelectItem>
                                    <SelectItem value="created_at">{t("common.oldest")}</SelectItem>
                                    <SelectItem value="display_name">{t("common.name")}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-orange-500" />
                        {t("aggregator.aggregatorsList")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                            <span className="text-gray-500">{t("aggregator.loadingAggregators")}</span>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center text-red-500">{error}</div>
                    ) : users.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">{t("aggregator.noAggregatorsFound")}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <TableRow>
                                        <TableHead>{t("aggregator.user")}</TableHead>
                                        <TableHead>{t("aggregator.contact")}</TableHead>
                                        <TableHead>{t("aggregator.balance")}</TableHead>
                                        <TableHead>{t("aggregator.status")}</TableHead>
                                        <TableHead>{t("aggregator.joined")}</TableHead>
                                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user) => (
                                        <TableRow key={user.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-md">
                                                        {user.display_name?.charAt(0).toUpperCase() || "A"}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{user.display_name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{user.uid}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                        <Mail className="h-3 w-3 mr-1" /> {user.email}
                                                    </div>
                                                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                                                        <Phone className="h-3 w-3 mr-1" /> {user.phone}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200">
                                                    {parseFloat(user.account_balance || "0").toLocaleString()} FCFA
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors",
                                                    user.is_active
                                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                                        : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800"
                                                )}>
                                                    <span className={cn(
                                                        "h-1.5 w-1.5 rounded-full",
                                                        user.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                                                    )} />
                                                    {user.is_active ? t("common.active") : t("common.inactive")}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem asChild>
                                                            <Link href={`/dashboard/aggregators/users/${user.uid}/stats`} className="cursor-pointer">
                                                                <Eye className="mr-2 h-4 w-4" /> {t("aggregator.viewStats")}
                                                            </Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleToggleStatus(user)}
                                                            disabled={togglingUid === user.uid}
                                                            className={cn("cursor-pointer", user.is_active ? "text-red-500" : "text-green-500")}
                                                        >
                                                            {user.is_active ? (
                                                                <><UserX className="mr-2 h-4 w-4" /> {t("aggregator.deactivateAccount")}</>
                                                            ) : (
                                                                <><UserCheck className="mr-2 h-4 w-4" /> {t("aggregator.activateAccount")}</>
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
                {pagination.total_pages > 1 && (
                    <div className="p-4 border-t bg-gray-50/30 dark:bg-gray-900/30 flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                            {t("common.showing")} <span className="font-medium">{users.length}</span> {t("common.of")} <span className="font-medium">{pagination.total_count}</span>
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pagination.has_previous || loading}
                                onClick={() => setPage(prev => prev - 1)}
                            >
                                {t("common.previous")}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pagination.has_next || loading}
                                onClick={() => setPage(prev => prev + 1)}
                            >
                                {t("common.next")}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div >
    )
}

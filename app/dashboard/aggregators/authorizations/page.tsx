"use client"

import { useState, useEffect, useCallback } from "react"
import { useAggregatorApi, UserAuthorization } from "@/lib/aggregator-api"
import { useLanguage } from "@/components/providers/language-provider"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
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
    Plus,
    Loader,
    RefreshCw,
    Edit,
    ShieldCheck,
    ShieldAlert,
    Search,
    Filter
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CreateAuthorizationModal } from "@/components/aggregator/create-authorization-modal"
import { Input } from "@/components/ui/input"

export default function AggregatorAuthorizationsPage() {
    const { t } = useLanguage()
    const { listAuthorizations } = useAggregatorApi()
    const { toast } = useToast()

    const [authorizations, setAuthorizations] = useState<UserAuthorization[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [modalOpen, setModalOpen] = useState(false)
    const [editingAuth, setEditingAuth] = useState<UserAuthorization | null>(null)

    const fetchAuthorizations = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await listAuthorizations()
            setAuthorizations(data.results || data || [])
        } catch (err: any) {
            setError(err.message || "Failed to load authorizations")
        } finally {
            setLoading(false)
        }
    }, [listAuthorizations])

    useEffect(() => {
        fetchAuthorizations()
    }, [fetchAuthorizations])

    const handleEdit = (auth: UserAuthorization) => {
        setEditingAuth(auth)
        setModalOpen(true)
    }

    const handleCreate = () => {
        setEditingAuth(null)
        setModalOpen(true)
    }

    const filteredAuthorizations = authorizations.filter(auth =>
        (auth.user_name || auth.user).toLowerCase().includes(searchTerm.toLowerCase()) ||
        (auth.network_name || auth.network).toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                        {t("nav.aggregatorAuthorizations")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Configure user-network access and fee structures
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={fetchAuthorizations} variant="outline" className="border-orange-200">
                        <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                        {t("dashboard.refresh") || "Refresh"}
                    </Button>
                    <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 shadow-md transition-all hover:shadow-lg">
                        <Plus className="mr-2 h-4 w-4" /> Grant New
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search by user or network..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-gray-50 dark:bg-gray-800"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Authorizations Table */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-orange-500" />
                        Network Access Rules
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && authorizations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                            <span className="text-gray-500">Loading authorizations...</span>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center text-red-500">{error}</div>
                    ) : filteredAuthorizations.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">No authorizations found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <TableRow>
                                        <TableHead>Aggregator</TableHead>
                                        <TableHead>Network</TableHead>
                                        <TableHead>Payin Fee</TableHead>
                                        <TableHead>Payout Fee</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAuthorizations.map((auth) => (
                                        <TableRow key={auth.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b">
                                            <TableCell>
                                                <div className="font-semibold text-gray-900 dark:text-gray-100">{auth.user_name || auth.user}</div>
                                                <div className="text-xs text-gray-500 font-mono italic">{auth.uid}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300">
                                                    {auth.network_name || auth.network}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                <span className="font-bold text-orange-600 dark:text-orange-400">{auth.user_payin_fee_percent}%</span>
                                            </TableCell>
                                            <TableCell className="font-mono">
                                                <span className="font-bold text-green-600 dark:text-green-400">{auth.user_payout_fee_percent}%</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center">
                                                    {auth.is_active ? (
                                                        <ShieldCheck className="h-4 w-4 text-green-500 mr-2" />
                                                    ) : (
                                                        <ShieldAlert className="h-4 w-4 text-red-500 mr-2" />
                                                    )}
                                                    <Badge variant={auth.is_active ? "success" : "destructive"} className="px-2 py-0">
                                                        {auth.is_active ? "Active" : "Locked"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(auth)}
                                                    className="hover:bg-orange-50 hover:text-orange-600"
                                                >
                                                    <Edit className="h-4 w-4" />
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

            <CreateAuthorizationModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={fetchAuthorizations}
                editingAuth={editingAuth}
            />
        </div>
    )
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

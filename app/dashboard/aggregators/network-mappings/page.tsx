"use client"

import { useState, useEffect, useCallback } from "react"
import { useAggregatorApi, NetworkMapping } from "@/lib/aggregator-api"
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
    Globe,
    Link as LinkIcon,
    Settings2,
    Activity,
    CheckCircle2,
    XCircle,
    Zap
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CreateNetworkMappingModal } from "@/components/aggregator/create-network-mapping-modal"
import { cn } from "@/lib/utils"

export default function AggregatorNetworkMappingsPage() {
    const { t } = useLanguage()
    const { listNetworkMappings } = useAggregatorApi()
    const { toast } = useToast()

    const [mappings, setMappings] = useState<NetworkMapping[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [modalOpen, setModalOpen] = useState(false)
    const [editingMapping, setEditingMapping] = useState<NetworkMapping | null>(null)

    const fetchMappings = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await listNetworkMappings()
            setMappings(data.results || data || [])
        } catch (err: any) {
            setError(err.message || "Failed to load network mappings")
        } finally {
            setLoading(false)
        }
    }, [listNetworkMappings])

    useEffect(() => {
        fetchMappings()
    }, [fetchMappings])

    const handleEdit = (mapping: NetworkMapping) => {
        setEditingMapping(mapping)
        setModalOpen(true)
    }

    const handleCreate = () => {
        setEditingMapping(null)
        setModalOpen(true)
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                        {t("nav.aggregatorNetworkMappings")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {t("aggregator.configureInfrastructure")}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={fetchMappings} variant="outline" className="border-orange-200">
                        <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                        {t("common.refresh")}
                    </Button>
                    <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 shadow-md transition-all hover:shadow-lg">
                        <Plus className="mr-2 h-4 w-4" /> {t("aggregator.newMapping")}
                    </Button>
                </div>
            </div>

            {/* Network Mappings Table */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                        {t("aggregator.infrastructureMappings")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && mappings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                            <span className="text-gray-500">{t("aggregator.loadingMappings")}</span>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center text-red-500">{error}</div>
                    ) : mappings.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">{t("aggregator.noMappingsFound")}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <TableRow>
                                        <TableHead>{t("common.network")}</TableHead>
                                        <TableHead>{t("aggregator.processor")}</TableHead>
                                        <TableHead>{t("aggregator.baseFee")}</TableHead>
                                        <TableHead>{t("aggregator.limits")}</TableHead>
                                        <TableHead>{t("aggregator.status")}</TableHead>
                                        <TableHead className="text-right">{t("common.actions")}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mappings.map((mapping: any) => (
                                        <TableRow key={mapping.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                        <Globe className="h-4 w-4 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 dark:text-gray-100">{mapping.network_name}</div>
                                                        <div className="text-xs text-gray-500 font-mono">{mapping.network}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 uppercase">
                                                    {mapping.payin_processor}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">
                                                <div className="flex flex-col">
                                                    <span className="text-orange-600 dark:text-orange-400 font-bold">{mapping.network_payin_fee_percent}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                                                <div className="space-y-1">
                                                    <div>Min: {parseFloat(mapping.min_amount).toLocaleString()}</div>
                                                    <div>Max: {parseFloat(mapping.max_amount).toLocaleString()}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className={cn(
                                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border w-fit transition-colors",
                                                        mapping.enable_payin
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"
                                                    )}>
                                                        <span className={cn(
                                                            "h-1.5 w-1.5 rounded-full",
                                                            mapping.enable_payin ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                                                        )} />
                                                        {mapping.enable_payin ? t("common.active") : t("aggregator.maintenance")}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(mapping)}
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

            <CreateNetworkMappingModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                onSuccess={fetchMappings}
                editingMapping={editingMapping}
            />
        </div >
    )
}

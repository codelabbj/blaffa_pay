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
    XCircle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { CreateNetworkMappingModal } from "@/components/aggregator/create-network-mapping-modal"

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
                        Configure global network settings and gateway adapters
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={fetchMappings} variant="outline" className="border-orange-200">
                        <RefreshCw className={loading ? "animate-spin mr-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                        {t("dashboard.refresh") || "Refresh"}
                    </Button>
                    <Button onClick={handleCreate} className="bg-orange-500 hover:bg-orange-600 shadow-md">
                        <Plus className="mr-2 h-4 w-4" /> New Mapping
                    </Button>
                </div>
            </div>

            {/* Mappings Table */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-orange-500" />
                        Infrastructure Mappings
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && mappings.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                            <span className="text-gray-500">Loading network configurations...</span>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center text-red-500">{error}</div>
                    ) : mappings.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">No network mappings configured.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <TableRow>
                                        <TableHead>Network</TableHead>
                                        <TableHead>Processor</TableHead>
                                        <TableHead>Base Fee</TableHead>
                                        <TableHead>Limits</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mappings.map((mapping) => (
                                        <TableRow key={mapping.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400">
                                                        <Globe className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold">{mapping.network_name || mapping.network}</div>
                                                        <div className="text-xs text-gray-500 font-mono italic">{mapping.network}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300">
                                                    {mapping.payin_processor.replace(/_/g, " ")}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300">
                                                {mapping.network_payin_fee_percent}%
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    <div className="text-gray-500">Min: <span className="font-semibold text-gray-900 dark:text-gray-100">{parseFloat(mapping.min_amount).toLocaleString()} FCFA</span></div>
                                                    <div className="text-gray-500">Max: <span className="font-semibold text-gray-900 dark:text-gray-100">{parseFloat(mapping.max_amount).toLocaleString()} FCFA</span></div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {mapping.enable_payin ? (
                                                    <div className="flex items-center text-green-600 font-medium text-sm">
                                                        <CheckCircle2 className="h-4 w-4 mr-1.5" /> Active
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center text-red-500 font-medium text-sm">
                                                        <XCircle className="h-4 w-4 mr-1.5" /> Maintenance
                                                    </div>
                                                )}
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
        </div>
    )
}

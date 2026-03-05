"use client"

import { useState, useEffect, useCallback } from "react"
import { useAggregatorApi, AggregatorTransaction } from "@/lib/aggregator-api"
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
    Loader,
    RefreshCw,
    FileText,
    ArrowUpRight,
    ArrowDownLeft,
    Filter,
    Search,
    Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { DateRangeFilter } from "@/components/ui/date-range-filter"
import { cn } from "@/lib/utils"

export default function AggregatorTransactionsPage() {
    const { t } = useLanguage()
    const { listTransactions } = useAggregatorApi()
    const { toast } = useToast()

    const [transactions, setTransactions] = useState<AggregatorTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [startDate, setStartDate] = useState<string | null>(null)
    const [endDate, setEndDate] = useState<string | null>(null)

    const fetchTransactions = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const params = new URLSearchParams()
            if (searchTerm) params.append("search", searchTerm)
            if (startDate) params.append("created_at__gte", startDate)
            if (endDate) params.append("created_at__lte", endDate)

            const data = await listTransactions(params)
            setTransactions(data.results || data || [])
        } catch (err: any) {
            setError(err.message || "Failed to load transactions")
        } finally {
            setLoading(false)
        }
    }, [listTransactions, searchTerm, startDate, endDate])

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions()
        }, 500)
        return () => clearTimeout(timer)
    }, [fetchTransactions])

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            success: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
            failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
        }
        return (
            <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
                {status.toUpperCase()}
            </Badge>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                        Audit Log
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        Detailed audit trail of all aggregator transactions and profit flows
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="border-gray-200">
                        <Download className="mr-2 h-4 w-4" /> Export
                    </Button>
                    <Button onClick={fetchTransactions} variant="outline" className="border-orange-200">
                        <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                        {t("dashboard.refresh") || "Refresh"}
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <Card className="border-0 shadow-md">
                <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by UID, user or network..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 bg-gray-50 dark:bg-gray-800"
                            />
                        </div>
                        <DateRangeFilter
                            startDate={startDate}
                            endDate={endDate}
                            onStartDateChange={setStartDate}
                            onEndDateChange={setEndDate}
                            onClear={() => {
                                setStartDate(null)
                                setEndDate(null)
                            }}
                            placeholder="Filter by date"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Transactions Table */}
            <Card className="border-0 shadow-lg overflow-hidden">
                <CardHeader className="border-b bg-gray-50/50 dark:bg-gray-900/50">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5 text-orange-500" />
                        Financial Flow Records
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading && transactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader className="animate-spin h-8 w-8 text-orange-500 mb-2" />
                            <span className="text-gray-500">Loading audit trail...</span>
                        </div>
                    ) : error ? (
                        <div className="py-20 text-center text-red-500">{error}</div>
                    ) : transactions.length === 0 ? (
                        <div className="py-20 text-center text-gray-500">No transactions recorded.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-gray-50/50 dark:bg-gray-900/50">
                                    <TableRow>
                                        <TableHead>Reference</TableHead>
                                        <TableHead>Aggregator</TableHead>
                                        <TableHead>Flow Path</TableHead>
                                        <TableHead>Amounts</TableHead>
                                        <TableHead>Economics</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.uid} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b">
                                            <TableCell>
                                                <div className="font-mono text-xs font-bold text-gray-600 dark:text-gray-400">
                                                    {tx.reference}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-semibold">{tx.user_name || tx.user}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">{tx.user}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 text-[10px]">
                                                        {tx.network_name || tx.network}
                                                    </Badge>
                                                    {tx.type === "payin" ? (
                                                        <ArrowDownLeft className="h-3 w-3 text-green-500" />
                                                    ) : (
                                                        <ArrowUpRight className="h-3 w-3 text-orange-500" />
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-gray-900 dark:text-gray-100">
                                                    {parseFloat(tx.amount).toLocaleString()} FCFA
                                                </div>
                                                <div className="text-[10px] text-gray-500">Net: {parseFloat(tx.net_amount).toLocaleString()}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-[10px] space-y-0.5">
                                                    <div className="text-blue-600">User Fee: {parseFloat(tx.user_fee).toLocaleString()}</div>
                                                    <div className="text-purple-600">Net Fee: {parseFloat(tx.network_fee).toLocaleString()}</div>
                                                    <div className="text-green-600 font-bold">Profit: {parseFloat(tx.platform_profit).toLocaleString()}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(tx.status)}
                                            </TableCell>
                                            <TableCell className="text-[10px] text-gray-500">
                                                {new Date(tx.created_at).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}



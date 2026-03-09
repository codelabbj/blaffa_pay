"use client"

import { useState, useEffect, useCallback } from "react"
import { useAggregatorApi, AggregatorDashboardStats, AggregatorTransaction } from "@/lib/aggregator-api"
import { useLanguage } from "@/components/providers/language-provider"
import { StatCard } from "@/components/aggregator/stat-card"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    Activity,
    TrendingUp,
    RefreshCw,
    Loader,
    BarChart3,
    ArrowLeft,
    User,
    Wallet,
    Calendar,
    ArrowDownLeft,
    ArrowUpRight
} from "lucide-react"
import {
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    BarChart,
    Bar,
    Cell
} from "recharts"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"

const CHART_COLORS = ['#FF6B35', '#00FF88', '#1E3A8A', '#EF4444', '#8B5CF6', '#EC4899']

export default function AggregatorUserStatsPage({ params }: { params: { uid: string } }) {
    const { uid } = params
    const { t } = useLanguage()
    const { getUserStats, listTransactions } = useAggregatorApi()

    const [stats, setStats] = useState<any | null>(null)
    const [transactions, setTransactions] = useState<AggregatorTransaction[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const txParams = new URLSearchParams()
            txParams.append("user", uid)
            txParams.append("page_size", "5")

            // Fetch stats and transactions independently so one failure doesn't block the other
            const [statsResult, txResult] = await Promise.allSettled([
                getUserStats(uid),
                listTransactions(txParams)
            ])

            if (statsResult.status === "fulfilled") {
                const data = statsResult.value
                if (data instanceof Error) {
                    setError(data.message)
                    setStats(null)
                } else if (data && data.error) {
                    setError(data.error)
                    setStats(null)
                } else {
                    setStats(data)
                }
            } else {
                console.warn("Stats endpoint unavailable:", statsResult.reason)
                setStats(null)
                setError("Endpoint unavailable")
            }

            if (txResult.status === "fulfilled") {
                const txData = txResult.value
                if (!(txData instanceof Error)) {
                    setTransactions(txData?.results || (Array.isArray(txData) ? txData : []))
                }
            }
            // Removed the complex error setting block here to avoid potential double-setting of error
            // Errors are now set immediately when a specific fetch fails.
        } catch (err: any) {
            setError(err.message || "Failed to load user statistics")
        } finally {
            setLoading(false)
        }
    }, [getUserStats, listTransactions, uid])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader className="animate-spin h-8 w-8 text-orange-500" />
            </div>
        )
    }

    if (error || !stats) {
        const is404 = error?.includes("404") || error?.toLowerCase().includes("introuvable") || error?.toLowerCase().includes("not found")

        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center animate-in zoom-in-95 duration-300">
                <div className="w-24 h-24 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6">
                    <Activity className="h-12 w-12 text-red-500" />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">
                    {is404 ? "404" : "Error"}
                </h1>
                <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                    {error || "We couldn't find the aggregator statistics you're looking for."}
                </h2>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/dashboard/aggregators/users">
                        <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-200 dark:shadow-none px-8">
                            <ArrowLeft className="mr-2 h-5 w-5" /> <span>Back to Users</span>
                        </Button>
                    </Link>
                    <Button onClick={() => window.location.reload()} variant="outline" size="lg" className="rounded-xl px-8 border-gray-200">
                        <RefreshCw className="mr-2 h-5 w-5" /> <span>Refresh Page</span>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                        <Link href="/dashboard/aggregators/users">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <User className="h-8 w-8 text-orange-500" />
                            {stats.user_name || "Aggregator Details"}
                        </h1>
                        <p className="text-gray-500 font-mono text-sm">{uid}</p>
                    </div>
                </div>
                <Button onClick={fetchData} variant="outline" className="border-orange-200">
                    <RefreshCw className={loading ? "animate-spin mr-2 h-4 w-4" : "mr-2 h-4 w-4"} />
                    <span>{t("dashboard.refresh") || "Refresh"}</span>
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Current Balance"
                    value={`${parseFloat(stats.balance || "0").toLocaleString()} FCFA`}
                    icon={Wallet}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                />
                <StatCard
                    title="Monthly Volume"
                    value={`${parseFloat(stats.monthly_volume || "0").toLocaleString()} FCFA`}
                    icon={TrendingUp}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white"
                />
                <StatCard
                    title="Success Rate"
                    value={`${(stats.success_rate || 0).toFixed(1)}%`}
                    icon={Activity}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                />
                <StatCard
                    title="Total Transactions"
                    value={stats.total_transactions || 0}
                    icon={Calendar}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Network Performance (User Specific) */}
                <Card className="lg:col-span-2 border-0 shadow-lg">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-orange-500" />
                            Volume by Network
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.network_performance || []}>
                                    <XAxis dataKey="network" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Bar dataKey="volume" radius={[8, 8, 0, 0]}>
                                        {(stats.network_performance || []).map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="border-b">
                        <CardTitle className="text-lg">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y">
                            {transactions.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No recent activity</div>
                            ) : (
                                transactions.map((tx) => (
                                    <div key={tx.uid} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                {tx.type === "payin" ? (
                                                    <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <ArrowUpRight className="h-4 w-4 text-orange-500" />
                                                )}
                                                <span className="font-semibold text-sm">{tx.network}</span>
                                            </div>
                                            <span className="font-bold text-sm">{parseFloat(tx.amount || "0").toLocaleString()} FCFA</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] text-gray-500">
                                            <span>{new Date(tx.created_at).toLocaleString()}</span>
                                            <Badge variant="outline" className="text-[8px] h-4 py-0">
                                                <span>{tx.status}</span>
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="p-4 border-t">
                            <Button asChild variant="ghost" className="w-full text-blue-600 hover:text-blue-700">
                                <Link href={`/dashboard/aggregators/transactions?user=${uid}`}>
                                    View Full Transactions
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

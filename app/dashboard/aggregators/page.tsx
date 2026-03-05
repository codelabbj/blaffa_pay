"use client"

import { useState, useEffect, useCallback } from "react"
import { useAggregatorApi, AggregatorDashboardStats } from "@/lib/aggregator-api"
import { useLanguage } from "@/components/providers/language-provider"
import { StatCard } from "@/components/aggregator/stat-card"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
    Users,
    Activity,
    TrendingUp,
    Zap,
    RefreshCw,
    Loader,
    BarChart3,
    PieChart as PieChartIcon,
    AlertCircle
} from "lucide-react"
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar
} from "recharts"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const COLORS = {
    primary: '#FF6B35',
    secondary: '#00FF88',
    accent: '#1E3A8A',
    danger: '#EF4444',
    warning: '#F97316',
    success: '#00FF88',
    info: '#1E3A8A',
}

const CHART_COLORS = ['#FF6B35', '#00FF88', '#1E3A8A', '#EF4444', '#8B5CF6', '#EC4899']

export default function AggregatorsOverviewPage() {
    const { t } = useLanguage()
    const { getDashboardStats } = useAggregatorApi()
    const [stats, setStats] = useState<AggregatorDashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await getDashboardStats()
            setStats(data)
        } catch (err: any) {
            setError(err.message || "Failed to load aggregator statistics")
        } finally {
            setLoading(false)
        }
    }, [getDashboardStats])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center space-y-4">
                    <Loader className="animate-spin h-8 w-8 text-orange-500" />
                    <span className="text-lg font-semibold">{t("dashboard.loading") || "Loading..."}</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">{t("dashboard.failedToLoadStats") || "Error loading dashboard"}</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <Button onClick={fetchStats} className="bg-orange-500 hover:bg-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <RefreshCw className="mr-2 h-4 w-4" /> {t("dashboard.retry") || "Retry"}
                </Button>
            </div>
        )
    }

    if (!stats) return null

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                        {t("nav.aggregators")}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {t("dashboard.liveOverview") || "Real-time overview of aggregator performance"}
                    </p>
                </div>
                <Button
                    onClick={fetchStats}
                    variant="outline"
                    className="self-start sm:self-center border-orange-200 hover:bg-orange-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-all duration-300"
                >
                    <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                    {t("dashboard.refresh") || "Refresh"}
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title={t("nav.aggregatorUsers")}
                    value={stats.total_aggregators}
                    icon={Users}
                    className="bg-gradient-to-br from-orange-500 to-orange-600 text-white"
                    description={`${stats.active_aggregators} active`}
                />
                <StatCard
                    title="Total Volume"
                    value={`${stats.total_volume.toLocaleString()} FCFA`}
                    icon={TrendingUp}
                    className="bg-gradient-to-br from-green-500 to-green-600 text-white"
                    description="Total processed amount"
                />
                <StatCard
                    title="Success Rate"
                    value={`${stats.success_rate.toFixed(1)}%`}
                    icon={Activity}
                    className="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                    description="Average across all networks"
                    trend={{ value: "+2.5%", isPositive: true }}
                />
                <StatCard
                    title="Active Networks"
                    value={stats.network_performance.length}
                    icon={Zap}
                    className="bg-gradient-to-br from-purple-500 to-purple-600 text-white"
                    description="Configured mappings"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Network Performance Bar Chart */}
                <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                        <CardTitle className="flex items-center space-x-2">
                            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                                <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-300" />
                            </div>
                            <span>Network Success Rate</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.network_performance} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                                    <XAxis dataKey="network" axisLine={false} tickLine={false} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    />
                                    <Bar dataKey="success_rate" radius={[8, 8, 0, 0]}>
                                        {stats.network_performance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Volume Distribution Pie Chart */}
                <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl overflow-hidden">
                    <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                        <CardTitle className="flex items-center space-x-2">
                            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                <PieChartIcon className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                            </div>
                            <span>Volume Distribution</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.network_performance}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="volume"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {stats.network_performance.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Network Performance Table */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800 transition-all duration-300 hover:shadow-xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50">
                    <CardTitle className="flex items-center space-x-2 text-lg">
                        <Activity className="h-5 w-5 text-orange-500" />
                        <span>Detailed Network Performance</span>
                    </CardTitle>
                </CardHeader>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs uppercase bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold tracking-wider">Network</th>
                                <th className="px-6 py-4 font-semibold tracking-wider">Success Rate</th>
                                <th className="px-6 py-4 font-semibold tracking-wider text-right">Volume</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {stats.network_performance.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{item.network}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full max-w-[100px]">
                                                <div
                                                    className="h-full rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)] transition-all duration-500"
                                                    style={{ width: `${item.success_rate}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-semibold">{item.success_rate.toFixed(1)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono text-sm">
                                        {item.volume.toLocaleString()} FCFA
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

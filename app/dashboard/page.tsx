"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ChartContainer } from "@/components/ui/chart"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useRouter } from "next/navigation"
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area } from "recharts";
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  ClipboardList, 
  Users, 
  KeyRound, 
  Bell, 
  Clock, 
  TrendingUp, 
  Loader, 
  ServerCrash, 
  DollarSign, 
  RefreshCw, 
  UserCheck,
  Activity,
  Zap,
  Shield,
  Globe,
  Smartphone,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Calendar,
  BarChart3,
  CreditCard,
  Settings,
  Waves,
  Phone,
  Wallet
} from "lucide-react";
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// Colors for charts and UI elements - using logo colors
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

const CHART_COLORS = ['#FF6B35', '#00FF88', '#1E3A8A', '#EF4444', '#8B5CF6', '#EC4899'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [authError, setAuthError] = useState("")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showOnlyActiveUsers, setShowOnlyActiveUsers] = useState(false)
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState("");
  const [transactionStats, setTransactionStats] = useState<any>(null);
  const [transactionStatsLoading, setTransactionStatsLoading] = useState(false);
  const [transactionStatsError, setTransactionStatsError] = useState("");
  const [systemEvents, setSystemEvents] = useState<any[]>([]);
  const [systemEventsLoading, setSystemEventsLoading] = useState(false);
  const [systemEventsError, setSystemEventsError] = useState("");
  const [balanceOps, setBalanceOps] = useState<any>(null);
  const [balanceOpsLoading, setBalanceOpsLoading] = useState(false);
  const [balanceOpsError, setBalanceOpsError] = useState("");
  const [rechargeStats, setRechargeStats] = useState<any>(null);
  const [rechargeLoading, setRechargeLoading] = useState(false);
  const [rechargeError, setRechargeError] = useState("");
  const [momoPayStats, setMomoPayStats] = useState<any>(null);
  const [momoPayLoading, setMomoPayLoading] = useState(false);
  const [momoPayError, setMomoPayError] = useState("");
  const [waveStats, setWaveStats] = useState<any>(null);
  const [waveLoading, setWaveLoading] = useState(false);
  const [waveError, setWaveError] = useState("");

  const apiFetch = useApi();
  const { t } = useLanguage();
  const router = useRouter();
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    setAuthError("");
    setShowAuthModal(false);
    try {
      const data = await apiFetch(`${baseUrl}api/auth/admin/notifications/stats/`);
      setStats(data);
    } catch (err: any) {
      let backendError = extractErrorMessages(err) || "Échec du chargement des statistiques";
      if (
        err?.code === 'token_not_valid' ||
        err?.status === 401 ||
        (typeof backendError === 'string' && backendError.toLowerCase().includes('token'))
      ) {
        setAuthError(backendError);
        setShowAuthModal(true);
        setLoading(false);
        return;
      }
      setError(backendError);
      toast({
        title: "Échec du chargement des statistiques",
        description: backendError,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch all data
  useEffect(() => {
    const fetchAllData = async () => {
      // Fetch summary data
      setSummaryLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}api/payments/dashboard/summary/`);
        setSummary(res);
      } catch (err: any) {
        setSummaryError("Échec du chargement du résumé des paiements");
      } finally {
        setSummaryLoading(false);
      }

  // Fetch transaction stats
      setTransactionStatsLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}api/payments/stats/transactions/`);
        setTransactionStats(res);
      } catch (err: any) {
        setTransactionStatsError("Échec du chargement des statistiques de transactions");
      } finally {
        setTransactionStatsLoading(false);
      }

  // Fetch system events
      setSystemEventsLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}api/payments/system-events/`);
        setSystemEvents(res.results || []);
      } catch (err: any) {
        setSystemEventsError("Échec du chargement des événements système");
      } finally {
        setSystemEventsLoading(false);
      }

  // Fetch balance operations stats
      setBalanceOpsLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}api/payments/admin/balance-operations/stats/`);
        setBalanceOps(res);
      } catch (err: any) {
        setBalanceOpsError("Échec du chargement des statistiques d'opérations de solde");
      } finally {
        setBalanceOpsLoading(false);
      }

  // Fetch recharge requests stats
      setRechargeLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}api/payments/user/recharge_requests/stats/`);
        setRechargeStats(res);
      } catch (err: any) {
        setRechargeError("Échec du chargement des statistiques de recharge");
      } finally {
        setRechargeLoading(false);
      }

  // Fetch MoMo Pay stats
      setMomoPayLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}api/payments/momo-pay-transactions/stats/`);
        setMomoPayStats(res);
      } catch (err: any) {
        setMomoPayError("Échec du chargement des statistiques MoMo Pay");
      } finally {
        setMomoPayLoading(false);
      }

  // Fetch Wave Business stats
      setWaveLoading(true);
      try {
        const res = await apiFetch(`${baseUrl}api/payments/wave-business-transactions/stats/`);
        setWaveStats(res);
      } catch (err: any) {
        setWaveError("Échec du chargement des statistiques Wave Business");
      } finally {
        setWaveLoading(false);
      }
    };

    fetchAllData();
  }, [apiFetch, baseUrl]);

  useEffect(() => {
    fetchStats();
  }, [apiFetch, baseUrl]);

  // Prepare chart data
  const prepareFinancialChartData = () => {
    if (!summary || !transactionStats || !balanceOps) return [];
    return [
      { name: "Revenus d'aujourd'hui", value: parseFloat(summary.today_revenue) || 0, color: COLORS.primary },
      { name: "Ajustements totaux", value: parseFloat(balanceOps?.adjustments?.total_credits?.total) || 0, color: COLORS.success },
      { name: "Remboursements totaux", value: parseFloat(balanceOps?.refunds?.total_amount) || 0, color: COLORS.danger }
    ];
  };

  const prepareAdminActivityData = () => {
    if (!balanceOps) return [];
    const adjustmentAdmins = balanceOps.adjustments?.by_admin || [];
    const refundAdmins = balanceOps.refunds?.by_admin || [];
    const adminMap = new Map();

    adjustmentAdmins.forEach((admin: any) => {
      const email = admin.created_by__email;
      if (!adminMap.has(email)) {
        adminMap.set(email, { email, adjustments: 0, refunds: 0, total: 0 });
      }
      const current = adminMap.get(email);
      current.adjustments = parseFloat(admin.total_amount) || 0;
      current.total += current.adjustments;
    });

    refundAdmins.forEach((admin: any) => {
      const email = admin.created_by__email;
      if (!adminMap.has(email)) {
        adminMap.set(email, { email, adjustments: 0, refunds: 0, total: 0 });
      }
      const current = adminMap.get(email);
      current.refunds = parseFloat(admin.total_amount) || 0;
      current.total += current.refunds;
    });

    return Array.from(adminMap.values());
  };

  const prepareTransactionTrendData = () => {
    if (!transactionStats) return [];
    return [
      { name: "Terminées", value: transactionStats.completed_transactions || 0, color: COLORS.success },
      { name: "En attente", value: transactionStats.pending_transactions || 0, color: COLORS.warning },
      { name: "Échouées", value: transactionStats.failed_transactions || 0, color: COLORS.danger },
      { name: "En cours", value: transactionStats.processing_transactions || 0, color: COLORS.info }
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="animate-spin h-8 w-8 text-orange-500" />
        <span className="text-lg font-semibold">Chargement...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={fetchStats}
        variant="full"
        showDismiss={false}
      />
    );
  }

  if (!stats) {
    return null;
  }

  const financialChartData = prepareFinancialChartData();
  const adminActivityData = prepareAdminActivityData();
  const transactionTrendData = prepareTransactionTrendData();

  return (
    <>
      {/* Auth Error Modal */}
      <Dialog open={showAuthModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erreur d'authentification</DialogTitle>
          </DialogHeader>
          <div className="py-4 text-center text-red-600">{authError}</div>
          <DialogFooter>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
              onClick={() => { setShowAuthModal(false); router.push("/"); }}
            >
              OK
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Dashboard Content */}
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Dashboard Header */}
        <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  Tableau de bord administrateur
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base lg:text-lg">
                  Aperçu en temps réel
                </p>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4">
                <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-lg px-3 sm:px-4 py-2 shadow-sm">
                  <Switch
                    id="active-users-toggle"
                    checked={showOnlyActiveUsers}
                    onCheckedChange={setShowOnlyActiveUsers}
                  />
                  <label htmlFor="active-users-toggle" className="text-xs sm:text-sm font-medium">
                    <span className="hidden sm:inline">Afficher uniquement les utilisateurs actifs</span>
                    <span className="sm:hidden">Utilisateurs actifs</span>
                  </label>
                </div>
                  {/* <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date().toLocaleTimeString()}
                      </span>
                      </div>
                  </div> */}
                    </div>
                    </div>
                  </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
            {/* Total Users */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                      <div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Utilisateurs totaux</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stats.user_stats.total_users}</p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                      <span className="text-xs sm:text-sm text-blue-100 ml-1">+{stats.user_stats.users_registered_today} aujourd'hui</span>
                      </div>
                      </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                    <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      </div>
            </CardContent>
          </Card>

            {/* Active Tasks */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm font-medium">Tâches actives</p>
                    <p className="text-2xl sm:text-3xl font-bold">{stats.task_stats.active}</p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                      <span className="text-xs sm:text-sm text-green-100 ml-1">En cours</span>
              </div>
                </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                    <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                  </div>
              </CardContent>
            </Card>

            {/* Today's Revenue */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-xs sm:text-sm font-medium">Revenus d'aujourd'hui</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {summary ? `${parseFloat(summary.today_revenue || 0).toFixed(2)}` : '0.00'} FCFA
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-purple-300" />
                      <span className="text-xs sm:text-sm text-purple-100 ml-1">
                        {summary ? `${summary.today_success_rate?.toFixed(1)}%` : '0%'} taux de réussite
                    </span>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8" />
                    </div>
                    </div>
            </CardContent>
          </Card>

            {/* System Status */}
            <Card className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -translate-y-16 translate-x-16"></div>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-xs sm:text-sm font-medium">Statut du système</p>
                    <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      {stats.notification_info.async_enabled ? 'En ligne' : 'Hors ligne'}
                    </p>
                    <div className="flex items-center mt-1 sm:mt-2">
                      {stats.notification_info.async_enabled ? (
                        <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-300" />
                      ) : (
                        <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-300" />
                      )}
                      <span className="text-xs sm:text-sm text-orange-100 ml-1">
                        {stats.notification_info.async_enabled ? 'Tous les systèmes' : 'Problèmes détectés'}
                      </span>
              </div>
              </div>
                  <div className="bg-white bg-opacity-20 rounded-full p-2 sm:p-3">
                    <Shield className="h-6 w-6 sm:h-8 sm:w-8" />
              </div>
                </div>
            </CardContent>
          </Card>
        </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
            {/* Financial Overview Chart */}
      {financialChartData.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-orange-600 dark:text-orange-300" />
              </div>
                    <span>Aperçu financier</span>
              </CardTitle>
            </CardHeader>
                <CardContent className="p-4 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                          label={({ name, value }) => `${name}: ${value.toFixed(2)} FCFA`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {financialChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                        <Tooltip formatter={(value) => [`${value} FCFA`, 'Montant']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
            )}

            {/* Transaction Trends */}
            {transactionTrendData.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
                    <span>Tendances des transactions</span>
              </CardTitle>
            </CardHeader>
                <CardContent className="p-4 sm:p-6">
              <div className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transactionTrendData}>
                        <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                        <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
            )}
          </div>

          {/* Detailed Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* User Statistics */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Users className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  <span>Statistiques des utilisateurs</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium">Utilisateurs totaux</span>
                    <Badge className="bg-blue-600 text-white">{stats.user_stats.total_users}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm font-medium">Utilisateurs actifs</span>
                    <Badge className="bg-green-600 text-white">{stats.user_stats.active_users}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <span className="text-sm font-medium">Utilisateurs en attente</span>
                    <Badge className="bg-yellow-600 text-white">{stats.user_stats.pending_users}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <span className="text-sm font-medium">Utilisateurs vérifiés</span>
                    <Badge className="bg-purple-600 text-white">{stats.user_stats.verified_users}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Statistics */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <ClipboardList className="h-5 w-5 text-green-600 dark:text-green-300" />
              </div>
                  <span>Statistiques des tâches</span>
              </CardTitle>
            </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <span className="text-sm font-medium">Tâches actives</span>
                    <Badge className="bg-green-600 text-white">{stats.task_stats.active}</Badge>
                </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <span className="text-sm font-medium">Tâches programmées</span>
                    <Badge className="bg-blue-600 text-white">{stats.task_stats.scheduled}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <span className="text-sm font-medium">Tâches réservées</span>
                    <Badge className="bg-orange-600 text-white">{stats.task_stats.reserved}</Badge>
                  </div>
                  </div>
              </CardContent>
            </Card>

            {/* System Information */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <span>Informations système</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <span className="text-sm font-medium">Service email</span>
                    <Badge variant="outline">{stats.notification_info.email_service}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <span className="text-sm font-medium">Service SMS</span>
                    <Badge variant="outline">{stats.notification_info.sms_service}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <span className="text-sm font-medium">Asynchrone activé</span>
                    <Badge className={stats.notification_info.async_enabled ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                      {stats.notification_info.async_enabled ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
                    <span className="text-sm font-medium">Journalisation activée</span>
                    <Badge className={stats.notification_info.logging_enabled ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                      {stats.notification_info.logging_enabled ? 'Oui' : 'Non'}
                    </Badge>
                </div>
                </div>
            </CardContent>
          </Card>
        </div>

          {/* Payment & Transaction Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-8">
            {/* Payment Summary */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <CreditCard className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
            </div>
                  <span>Résumé des paiements</span>
            </CardTitle>
          </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {summaryLoading ? (
                  <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin mr-2" /> Chargement...
              </div>
                ) : summaryError ? (
                  <div className="text-red-600 text-center py-4">{summaryError}</div>
                ) : summary ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-300 font-medium">Transactions d'aujourd'hui</div>
                      <div className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">{summary.today_transactions}</div>
                    </div>
                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-green-600 dark:text-green-300 font-medium">Terminées</div>
                      <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{summary.today_completed}</div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-purple-600 dark:text-purple-300 font-medium">Revenus</div>
                      <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">{parseFloat(summary.today_revenue || 0).toFixed(2)} FCFA</div>
                    </div>
                    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-3 sm:p-4 rounded-lg">
                      <div className="text-xs sm:text-sm text-orange-600 dark:text-orange-300 font-medium">Taux de réussite</div>
                      <div className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">{summary.today_success_rate?.toFixed(1)}%</div>
                    </div>
              </div>
            ) : (
                  <div className="text-gray-500 text-center py-8">Aucune donnée disponible</div>
            )}
          </CardContent>
        </Card>

            {/* System Events */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
            </div>
                  <span>Événements système récents</span>
            </CardTitle>
          </CardHeader>
              <CardContent className="p-6">
            {systemEventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                <Loader className="animate-spin mr-2" /> Chargement...
              </div>
            ) : systemEventsError ? (
                  <div className="text-red-600 text-center py-4">{systemEventsError}</div>
            ) : systemEvents && systemEvents.length > 0 ? (
                  <div className="space-y-4 max-h-80 overflow-y-auto">
                {systemEvents.slice(0, 5).map((event, idx) => (
                      <div key={event.uid} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-sm">{event.event_type.replace(/_/g, " ").toUpperCase()}</span>
                          <Badge variant="outline" className="text-xs">{event.level}</Badge>
                    </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">{event.description}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(event.created_at).toLocaleString()}
                        </div>
                  </div>
                ))}
              </div>
            ) : (
                  <div className="text-gray-500 text-center py-8">Aucun événement récent</div>
            )}
          </CardContent>
        </Card>
      </div>

          {/* Additional Stats Cards */}
          {rechargeStats && (
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-lg">
                    <RefreshCw className="h-5 w-5 text-sky-600 dark:text-sky-300" />
                  </div>
                  <span>Aperçu des demandes de recharge</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-sky-50 dark:bg-sky-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-sky-600 dark:text-sky-300">{rechargeStats.total_requests}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Demandes totales</div>
                  </div>
                  <div className="text-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">{rechargeStats.pending_review}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">En attente de révision</div>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{parseFloat(rechargeStats.total_approved_amount || 0).toFixed(2)} FCFA</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Montant approuvé</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Balance Operations */}
          {balanceOps && (
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-8">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                    <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          </div>
                  <span>Opérations de solde</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{balanceOps.adjustments.total_count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Ajustements totaux</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">{balanceOps.adjustments.total_credits.count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Crédits</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">{balanceOps.adjustments.total_debits.count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Débits</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-300">{balanceOps.refunds.total_count}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Remboursements</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* MoMo Pay Statistics */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Smartphone className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <span>Statistiques MoMo Pay</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {momoPayLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="animate-spin mr-2" /> Chargement...
                  </div>
                ) : momoPayError ? (
                  <div className="text-red-600 text-center py-4">{momoPayError}</div>
                ) : momoPayStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-300 font-medium">Total Transactions</div>
                        <div className="text-2xl font-bold text-green-900 dark:text-green-100">{momoPayStats.total_transactions || 0}</div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                        <div className="text-sm text-orange-600 dark:text-orange-300 font-medium">Montant Total</div>
                        <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{parseFloat((momoPayStats.total_amount || 0).toString()).toFixed(2)} FCFA</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg">
                        <div className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">Confirmées</div>
                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{momoPayStats.confirmed_count || 0}</div>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg">
                        <div className="text-sm text-yellow-600 dark:text-yellow-300 font-medium">En Attente</div>
                        <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{momoPayStats.pending_count || 0}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
                        <div className="text-sm text-red-600 dark:text-red-300 font-medium">Annulées</div>
                        <div className="text-2xl font-bold text-red-900 dark:text-red-100">{momoPayStats.cancelled_count || 0}</div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                        <div className="text-sm text-orange-600 dark:text-orange-300 font-medium">Échouées</div>
                        <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{momoPayStats.failed_count || 0}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">Aucune donnée disponible</div>
                )}
              </CardContent>
            </Card>

            {/* Wave Business Statistics */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Waves className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  <span>Statistiques Wave Business</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {waveLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="animate-spin mr-2" /> Chargement...
                  </div>
                ) : waveError ? (
                  <div className="text-red-600 text-center py-4">{waveError}</div>
                ) : waveStats ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
                        <div className="text-sm text-orange-600 dark:text-orange-300 font-medium">Total Transactions</div>
                        <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{waveStats.total_transactions || 0}</div>
                      </div>
                      <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 dark:text-purple-300 font-medium">Montant Total</div>
                        <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{parseFloat((waveStats.total_amount || 0).toString()).toFixed(2)} FCFA</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-lg">
                        <div className="text-sm text-emerald-600 dark:text-emerald-300 font-medium">Confirmées</div>
                        <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">{waveStats.confirmed_count || 0}</div>
                      </div>
                      <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 p-4 rounded-lg">
                        <div className="text-sm text-yellow-600 dark:text-yellow-300 font-medium">En Attente</div>
                        <div className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">{waveStats.pending_count || 0}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg">
                        <div className="text-sm text-red-600 dark:text-red-300 font-medium">Annulées</div>
                        <div className="text-2xl font-bold text-red-900 dark:text-red-100">{waveStats.cancelled_count || 0}</div>
                      </div>
                      <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
                        <div className="text-sm text-orange-600 dark:text-orange-300 font-medium">Expirées</div>
                        <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{waveStats.expired_count || 0}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8">Aucune donnée disponible</div>
                )}
              </CardContent>
            </Card>
          </div>

      </div>
    </div>
    </>
  )
}
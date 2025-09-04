"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import Link from "next/link"
import { Search, ArrowUpDown, Settings, Filter, CheckCircle, XCircle, Globe, Plus, Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

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

export default function NetworkConfigListPage() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [networkFilter, setNetworkFilter] = useState("all")
  const [networks, setNetworks] = useState<any[]>([])
  const [sortField, setSortField] = useState<"network_name" | "created_at" | null>(null)
  const [sortDirection, setSortDirection] = useState<"+" | "-">("-")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const fetchNetworkConfigs = async () => {
      setLoading(true)
      setError("")
      try {
        let endpoint = "";
        if (searchTerm.trim() !== "" || statusFilter !== "all" || networkFilter !== "all" || sortField) {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          if (searchTerm.trim() !== "") {
            params.append("search", searchTerm);
          }
          if (statusFilter !== "all") {
            params.append("is_active", statusFilter === "active" ? "true" : "false");
          }
          if (networkFilter !== "all") {
            params.append("network", networkFilter);
          }
          if (sortField) {
            params.append("ordering", `${sortDirection === "+" ? "+" : "-"}${sortField}`);
          }
          // Keep '+' literal for ordering (avoid %2B)
          const query = params.toString().replace(/ordering=%2B/g, "ordering=+");
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/network-configs/?${query}`;
        } else {
          const params = new URLSearchParams({
            page: "1",
            page_size: "100",
          });
          endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/network-configs/?${params.toString()}`;
        }
        const data = await apiFetch(endpoint)
        setConfigs(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("networkConfig.success"),
          description: t("networkConfig.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("networkConfig.failedToLoad")
        setError(errorMessage)
        setConfigs([])
        toast({
          title: t("networkConfig.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('Network config fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchNetworkConfigs()
  }, [searchTerm, statusFilter, networkFilter, sortField, sortDirection])

  // Fetch networks for filter
  useEffect(() => {
    const fetchNetworks = async () => {
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/`)
        setNetworks(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("networkConfig.networksLoaded"),
          description: t("networkConfig.networksLoadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("networkConfig.failedToLoadNetworks")
        console.error('Networks fetch error:', err)
        setNetworks([])
        toast({
          title: t("networkConfig.networksFailedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
    fetchNetworks()
  }, [])

  const filteredConfigs = configs

  const handleSort = (field: "network_name" | "created_at") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "+" ? "-" : "+"))
      setSortField(field)
    } else {
      setSortField(field)
      setSortDirection("-")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {t("networkConfig.list") || "Network Configurations"}
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Manage network configurations and settings
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-2 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {configs.length} configurations
                  </span>
                </div>
              </div>
        <Link href="/dashboard/network-config/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
        </Link>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
                  placeholder="Search configurations..."
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
                  <SelectItem value="all">All Configurations</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

              {/* Network Filter */}
          <Select value={networkFilter} onValueChange={setNetworkFilter}>
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Filter by network" />
            </SelectTrigger>
            <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  {networks.map((network) => (
                    <SelectItem key={network.id || network.uid} value={network.id || network.uid}>
                  {network.nom}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

              {/* Sort */}
              <Select 
                value={sortField || ""} 
                onValueChange={(value) => setSortField(value as "network_name" | "created_at" | null)}
              >
                <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="network_name">Network Name</SelectItem>
                  <SelectItem value="created_at">Date</SelectItem>
                </SelectContent>
              </Select>
        </div>
          </CardContent>
        </Card>

        {/* Network Configs Table */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <Settings className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
              </div>
              <span>Network Configurations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
        {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600 dark:text-gray-300">Loading configurations...</span>
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
                      <TableHead className="font-semibold">Configuration Name</TableHead>
                      <TableHead className="font-semibold">Network</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">Last Updated</TableHead>
                      <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
                    {filteredConfigs.map((config) => (
                      <TableRow key={config.id || config.uid} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                  <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                              <Settings className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-gray-100">
                                {config.name || config.config_name || 'Unnamed Config'}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {config.description || 'No description'}
                              </div>
                            </div>
                    </div>
                  </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Globe className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {config.network?.nom || config.network_name || 'Unknown'}
                            </span>
                    </div>
                  </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {config.config_type || config.type || 'Standard'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            className={
                              config.is_active 
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            }
                          >
                            <div className="flex items-center space-x-1">
                              {config.is_active ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              <span>{config.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                          </Badge>
                  </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {config.updated_at 
                              ? new Date(config.updated_at).toLocaleString()
                              : config.created_at 
                              ? new Date(config.created_at).toLocaleString()
                              : 'Unknown'
                            }
                    </div>
                  </TableCell>
                  <TableCell>
                          <div className="flex items-center space-x-2">
                            <Link href={`/dashboard/network-config/edit/${config.id || config.uid}`}>
                              <Button variant="outline" size="sm">
                                <Pencil className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                    </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={
                                config.is_active 
                                  ? "text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20" 
                                  : "text-green-600 border-green-200 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20"
                              }
                            >
                              {config.is_active ? 'Deactivate' : 'Activate'}
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

        {/* Empty State */}
        {!loading && !error && filteredConfigs.length === 0 && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-6">
            <CardContent className="p-12 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No configurations found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchTerm ? `No configurations match "${searchTerm}"` : "No network configurations have been added yet."}
              </p>
              <Link href="/dashboard/network-config/create">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Configuration
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  )
} 
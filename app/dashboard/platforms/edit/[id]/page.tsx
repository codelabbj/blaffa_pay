"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/lib/useApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useLanguage } from "@/components/providers/language-provider"
import { ArrowLeft, Save, Loader2, CheckCircle, XCircle, BarChart3, Search, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

// Colors for consistent theming - using logo colors
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

interface Platform {
  uid: string;
  name: string;
  external_id: string;
  logo: string | null;
  is_active: boolean;
  min_deposit_amount: string;
  max_deposit_amount: string;
  min_withdrawal_amount: string;
  max_withdrawal_amount: string;
  description: string;
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  active_partners_count: number;
  total_transactions_count: number;
}

interface PlatformForm {
  name: string;
  min_deposit_amount: string;
  max_deposit_amount: string;
  min_withdrawal_amount: string;
  max_withdrawal_amount: string;
  description: string;
  is_active: boolean;
}

export default function EditPlatformPage() {
  const params = useParams()
  const platformId = params.id as string
  
  const [form, setForm] = useState<PlatformForm>({
    name: "",
    min_deposit_amount: "",
    max_deposit_amount: "",
    min_withdrawal_amount: "",
    max_withdrawal_amount: "",
    description: "",
    is_active: true,
  })
  
  const [platform, setPlatform] = useState<Platform | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState("")
  const [fetchError, setFetchError] = useState("")
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const apiFetch = useApi();
  const router = useRouter()

  // Fetch platform data on component mount
  useEffect(() => {
    const fetchPlatform = async () => {
      if (!platformId) return
      
      setFetchLoading(true)
      setFetchError("")
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/platforms/${platformId}/`
        const data = await apiFetch(endpoint)
        setPlatform(data)
        
        // Populate form with existing data
        setForm({
          name: data.name || "",
          min_deposit_amount: data.min_deposit_amount || "",
          max_deposit_amount: data.max_deposit_amount || "",
          min_withdrawal_amount: data.min_withdrawal_amount || "",
          max_withdrawal_amount: data.max_withdrawal_amount || "",
          description: data.description || "",
          is_active: data.is_active ?? true,
        })
        
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setFetchError(errorMessage)
        toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
      } finally {
        setFetchLoading(false)
      }
    }
    fetchPlatform()
  }, [platformId, baseUrl, apiFetch, toast])

  const handleInputChange = (field: keyof PlatformForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const payload = {
        name: form.name,
        min_deposit_amount: parseFloat(form.min_deposit_amount).toFixed(2),
        max_deposit_amount: parseFloat(form.max_deposit_amount).toFixed(2),
        min_withdrawal_amount: parseFloat(form.min_withdrawal_amount).toFixed(2),
        max_withdrawal_amount: parseFloat(form.max_withdrawal_amount).toFixed(2),
        description: form.description,
        is_active: form.is_active,
      }

      const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/platforms/${platformId}/`
      const data = await apiFetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      toast({ 
        title: "Succès", 
        description: "Plateforme mise à jour avec succès" 
      })
      
      router.push("/dashboard/platforms/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({ title: "Erreur", description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    if (platform) {
      setForm({
        name: platform.name || "",
        min_deposit_amount: platform.min_deposit_amount || "",
        max_deposit_amount: platform.max_deposit_amount || "",
        min_withdrawal_amount: platform.min_withdrawal_amount || "",
        max_withdrawal_amount: platform.max_withdrawal_amount || "",
        description: platform.description || "",
        is_active: platform.is_active ?? true,
      })
    }
    setError("")
  }

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              <span className="text-gray-600 dark:text-gray-300">Chargement de la plateforme...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/dashboard/platforms/list">
                <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </div>
          </div>
          <ErrorDisplay error={fetchError} />
        </div>
      </div>
    )
  }

  if (!platform) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="flex items-center space-x-4 mb-4">
              <Link href="/dashboard/platforms/list">
                <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour
                </Button>
              </Link>
            </div>
          </div>
          <ErrorDisplay error="Plateforme non trouvée" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/dashboard/platforms/list">
              <Button variant="outline" size="sm" className="bg-white dark:bg-gray-800">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
              Modifier la Plateforme
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
              Modifier les informations de {platform.name}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Platform Info */}
          <div className="lg:col-span-1">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>Informations Actuelles</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-green-600 rounded-lg flex items-center justify-center text-white font-semibold">
                      {platform.name?.charAt(0)?.toUpperCase() || 'P'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {platform.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        ID: {platform.external_id}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <Badge 
                      className={
                        platform.is_active 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                      }
                    >
                      {platform.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Partenaires actifs: {platform.active_partners_count}</div>
                    <div>Transactions: {platform.total_transactions_count}</div>
                    <div>Créé le: {new Date(platform.created_at).toLocaleDateString()}</div>
                    <div>Créé par: {platform.created_by_name}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Platform Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-orange-600" />
                  <span>Modifier la Plateforme</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
                      <ErrorDisplay error={error} />
                    </div>
                  )}

                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom de la plateforme *</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Ex: 1xbet"
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="external_id">ID Externe</Label>
                      <Input
                        id="external_id"
                        value={platform.external_id}
                        disabled
                        className="mt-1 bg-gray-100 dark:bg-gray-700"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        L'ID externe ne peut pas être modifié
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={form.description}
                      onChange={(e) => handleInputChange("description", e.target.value)}
                      placeholder="Description de la plateforme"
                      rows={3}
                      required
                      className="mt-1"
                    />
                  </div>

                  {/* Deposit Limits */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Limites de Dépôt</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min_deposit_amount">Montant minimum (FCFA) *</Label>
                        <Input
                          id="min_deposit_amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.min_deposit_amount}
                          onChange={(e) => handleInputChange("min_deposit_amount", e.target.value)}
                          placeholder="1000.00"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_deposit_amount">Montant maximum (FCFA) *</Label>
                        <Input
                          id="max_deposit_amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.max_deposit_amount}
                          onChange={(e) => handleInputChange("max_deposit_amount", e.target.value)}
                          placeholder="500000.00"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Withdrawal Limits */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Limites de Retrait</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min_withdrawal_amount">Montant minimum (FCFA) *</Label>
                        <Input
                          id="min_withdrawal_amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.min_withdrawal_amount}
                          onChange={(e) => handleInputChange("min_withdrawal_amount", e.target.value)}
                          placeholder="1000.00"
                          required
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="max_withdrawal_amount">Montant maximum (FCFA) *</Label>
                        <Input
                          id="max_withdrawal_amount"
                          type="number"
                          step="0.01"
                          min="0"
                          value={form.max_withdrawal_amount}
                          onChange={(e) => handleInputChange("max_withdrawal_amount", e.target.value)}
                          placeholder="300000.00"
                          required
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="flex items-center space-x-3">
                    <Switch
                      id="is_active"
                      checked={form.is_active}
                      onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                    />
                    <Label htmlFor="is_active" className="text-sm font-medium">
                      Plateforme active
                    </Label>
                  </div>

                  {/* Form Actions */}
                  <div className="flex items-center space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Mise à jour...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Mettre à jour
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      Réinitialiser
                    </Button>
                    <Link href="/dashboard/platforms/list">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                      >
                        Annuler
                      </Button>
                    </Link>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Current Limits Preview */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mt-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Limites Actuelles</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-3">Limites de Dépôt</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Minimum:</span>
                    <span className="ml-2 text-lg font-semibold text-orange-600">
                      {parseFloat(platform.min_deposit_amount).toFixed(2)} FCFA
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Maximum:</span>
                    <span className="ml-2 text-lg font-semibold text-orange-600">
                      {parseFloat(platform.max_deposit_amount).toFixed(2)} FCFA
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 dark:text-green-300 mb-3">Limites de Retrait</h4>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Minimum:</span>
                    <span className="ml-2 text-lg font-semibold text-green-600">
                      {parseFloat(platform.min_withdrawal_amount).toFixed(2)} FCFA
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Maximum:</span>
                    <span className="ml-2 text-lg font-semibold text-green-600">
                      {parseFloat(platform.max_withdrawal_amount).toFixed(2)} FCFA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

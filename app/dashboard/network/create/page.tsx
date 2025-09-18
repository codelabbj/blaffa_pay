"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Globe, ArrowLeft, Save, Loader2, Settings, CheckCircle } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

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

export default function NetworkCreatePage() {
  const [nom, setNom] = useState("")
  const [code, setCode] = useState("")
  const [country, setCountry] = useState("")
  const [ussdBaseCode, setUssdBaseCode] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [sentDepositToModule, setSentDepositToModule] = useState(false)
  const [sentWithdrawalToModule, setSentWithdrawalToModule] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/countries/`)
        setCountries(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("network.countriesLoaded"),
          description: t("network.countriesLoadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("network.failedToLoadCountries")
        setCountries([])
        toast({
          title: t("network.countriesFailedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
    fetchCountries()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/payments/networks/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          nom, 
          code, 
          country, 
          ussd_base_code: ussdBaseCode, 
          is_active: isActive,
          sent_deposit_to_module: sentDepositToModule,
          sent_withdrawal_to_module: sentWithdrawalToModule
        })
      })
      toast({
        title: t("network.created"),
        description: t("network.createdSuccessfully"),
      })
      router.push("/dashboard/network/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("network.failedToCreate")
      setError(errorMessage)
      toast({
        title: t("network.failedToCreate"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  {t("network.create") || "Create Network"}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  Ajouter une nouvelle configuration de réseau
                </p>
              </div>
            </div>
          </div>
      </div>

        {error && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <ErrorDisplay error={error} />
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Globe className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                </div>
                <span>Informations de base</span>
              </CardTitle>
      </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
                  <Label htmlFor="nom">Nom du réseau</Label>
                  <Input
                    id="nom"
                    value={nom}
                    onChange={(e) => setNom(e.target.value)}
                    placeholder="ex: MTN, Orange, Airtel"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    required
                  />
          </div>
          <div>
                  <Label htmlFor="code">Code du réseau</Label>
                  <Input
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="ex: MTN, ORG, AIR"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    required
                  />
          </div>
          <div>
                  <Label htmlFor="country">Pays</Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                      <SelectValue placeholder="Sélectionner le pays" />
              </SelectTrigger>
              <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id || country.uid} value={country.id || country.uid}>
                          {country.nom}
                  </SelectItem>
                      ))}
              </SelectContent>
            </Select>
          </div>
          <div>
                  <Label htmlFor="ussdBaseCode">Code de base USSD</Label>
                  <Input
                    id="ussdBaseCode"
                    value={ussdBaseCode}
                    onChange={(e) => setUssdBaseCode(e.target.value)}
                    placeholder="ex: *123#"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  />
            </div>
              </div>
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Settings className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <span>Paramètres</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <Label htmlFor="isActive">Actif</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
                    id="sentDepositToModule"
              checked={sentDepositToModule}
              onCheckedChange={setSentDepositToModule}
            />
                  <Label htmlFor="sentDepositToModule">Envoyer le dépôt au module</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
                    id="sentWithdrawalToModule"
              checked={sentWithdrawalToModule}
              onCheckedChange={setSentWithdrawalToModule}
            />
                  <Label htmlFor="sentWithdrawalToModule">Envoyer le retrait au module</Label>
                </div>
          </div>
      </CardContent>
    </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => router.back()}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Créer le réseau
                </>
              )}
            </Button>
          </div>
        </form>

      </div>
    </div>
  )
} 
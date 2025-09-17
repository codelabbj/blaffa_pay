"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { ArrowLeft, Save, Loader2, UserPlus, Mail, Phone, User, Shield } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"

// Colors for consistent theming - using logo colors with orange as primary
const COLORS = {
  primary: '#F97316', // Orange from logo
  secondary: '#171717', // Dark gray/black from logo
  accent: '#FFFFFF', // White from logo
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#22C55E',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  indigo: '#6366F1'
};

export default function RegisterUserForm() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    identifier: "",
    password: "",
    password_confirm: "",
    is_partner: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { t } = useLanguage();
  const apiFetch = useApi();
  const { toast } = useToast();
  const router = useRouter();

  // Get base URL and token from env
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const apiToken = process.env.NEXT_PUBLIC_API_TOKEN || ""

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (form.password !== form.password_confirm) {
      setError("Les mots de passe ne correspondent pas")
      toast({
        title: "Échec de l'inscription",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      })
      return
    }
    setLoading(true)
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      }
      if (apiToken) {
        headers["Authorization"] = `Bearer ${apiToken}`
      }
      // Map identifier to email or phone for backend compatibility
      const isEmail = /@/.test(form.identifier)
      const submitBody = {
        first_name: form.first_name,
        last_name: form.last_name,
        email: isEmail ? form.identifier : null,
        phone: isEmail ? null : form.identifier,
        password: form.password,
        password_confirm: form.password_confirm,
        is_partner: form.is_partner,
      }
      const data = await apiFetch(`${baseUrl.replace(/\/$/, "")}/api/auth/register/`, {
        method: "POST",
        headers,
        body: JSON.stringify(submitBody),
      })
      if (data && data.detail) {
        const backendError = extractErrorMessages(data)
        setError(backendError)
        toast({
          title: "Échec de l'inscription",
          description: backendError,
          variant: "destructive",
        })
      } else {
        setSuccess("Utilisateur enregistré avec succès")
        toast({
          title: "Succès",
          description: "Utilisateur enregistré avec succès",
        })
        setForm({
          first_name: "",
          last_name: "",
          identifier: "",
          password: "",
          password_confirm: "",
          is_partner: false,
        })
      }
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || "Échec de l'inscription"
      setError(errorMessage)
      toast({
        title: "Échec de l'inscription",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Button> */}
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-600 bg-clip-text text-transparent">
                  {t("register.title") || "Enregistrer un utilisateur"}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  Créer un nouveau compte utilisateur
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

        {success && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-2 text-green-600">
                <UserPlus className="h-5 w-5" />
                <span className="font-medium">{success}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
           
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">Prénom</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="Entrez le prénom"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Nom de famille</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Entrez le nom de famille"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="identifier">Email ou téléphone</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="Entrez l'email ou le numéro de téléphone"
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Entrez soit une adresse email soit un numéro de téléphone
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Entrez le mot de passe"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password_confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    value={form.password_confirm}
                    onChange={handleChange}
                    placeholder="Confirmez le mot de passe"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            {/* <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Mail className="h-5 w-5 text-green-600 dark:text-green-300" />
                </div>
                <span>Informations de contact</span>
              </CardTitle>
            </CardHeader> */}
            {/* <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="identifier">Email ou téléphone</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  value={form.identifier}
                  onChange={handleChange}
                  placeholder="Entrez l'email ou le numéro de téléphone"
                  className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Entrez soit une adresse email soit un numéro de téléphone
                </p>
              </div>
            </CardContent> */}
          </Card>

          {/* Security */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            {/* <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <span>Sécurité</span>
              </CardTitle>
            </CardHeader> */}
            {/* <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Entrez le mot de passe"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password_confirm">Confirmer le mot de passe</Label>
                  <Input
                    id="password_confirm"
                    name="password_confirm"
                    type="password"
                    value={form.password_confirm}
                    onChange={handleChange}
                    placeholder="Confirmez le mot de passe"
                    className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                    required
                  />
                </div>
              </div>
            </CardContent> */}
          </Card>

          {/* User Type */}
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
            {/* <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="flex items-center space-x-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <UserPlus className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                </div>
                <span>Type d'utilisateur</span>
              </CardTitle>
            </CardHeader> */}
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_partner"
                  name="is_partner"
                  checked={form.is_partner}
                  onCheckedChange={(checked) => setForm({ ...form, is_partner: checked })}
                />
                <Label htmlFor="is_partner">S'enregistrer comme partenaire</Label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Les partenaires ont accès au suivi des commissions et à des fonctionnalités supplémentaires
              </p>
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
              className="bg-gradient-to-r from-blue-600 to-blue-600 hover:from-blue-700 hover:to-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer l'utilisateur
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
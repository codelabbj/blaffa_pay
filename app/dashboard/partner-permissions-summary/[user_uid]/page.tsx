"use client"

import { useState, useEffect } from "react"
import { useApi } from "@/lib/useApi"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { ArrowLeft, Users, DollarSign, Calendar, CheckCircle, XCircle, Clock, AlertTriangle, Copy, Shield, BarChart3, TrendingUp, Settings, Key, Globe, Timer } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Partner {
  success: boolean;
  user_info: {
    uid: string;
    display_name: string;
    first_name: string;
    last_name: string;
    email: string;
    is_partner: boolean;
    is_active: boolean;
  };
  commission_config: {
    has_config: boolean;
    deposit_commission_rate: number;
    withdrawal_commission_rate: number;
    updated_at: string | null;
    updated_by_name: string | null;
    status: string;
  };
  summary: {
    total_platforms: number;
    platforms_with_permissions: number;
    platforms_without_permissions: number;
    active_permissions: number;
    inactive_permissions: number;
  };
  platforms_with_permissions: Array<{
    platform_uid: string;
    platform_name: string;
    platform_external_id: string;
    platform_is_active: boolean;
    platform_logo: string;
    min_deposit_amount: number;
    max_deposit_amount: number;
    min_withdrawal_amount: number;
    max_withdrawal_amount: number;
    has_permission: boolean;
    can_deposit: boolean;
    can_withdraw: boolean;
    is_active: boolean;
    granted_by_name: string | null;
    created_at: string | null;
    transaction_stats: {
      total_transactions: number;
      successful_transactions: number;
      failed_transactions: number;
      pending_transactions: number;
      deposit_count: number;
      withdrawal_count: number;
      total_amount: number;
      total_commission: number;
      unpaid_commission: number;
    };
  }>;
  platforms_without_permissions: Array<{
    platform_uid: string;
    platform_name: string;
    platform_external_id: string;
    platform_is_active: boolean;
    platform_logo: string;
    min_deposit_amount: number;
    max_deposit_amount: number;
    min_withdrawal_amount: number;
    max_withdrawal_amount: number;
    has_permission: boolean;
    can_deposit: boolean;
    can_withdraw: boolean;
    is_active: boolean;
    granted_by_name: string | null;
    created_at: string | null;
    transaction_stats: {
      total_transactions: number;
      successful_transactions: number;
      failed_transactions: number;
      pending_transactions: number;
      deposit_count: number;
      withdrawal_count: number;
      total_amount: number;
      total_commission: number;
      unpaid_commission: number;
    };
  }>;
}

export default function PartnerDetailsPage({ params }: { params: { user_uid: string } }) {
  const userUid = params.user_uid;
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const apiFetch = useApi();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPartner = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/betting/admin/permissions/user_platforms/?user_uid=${userUid}`;
        const data = await apiFetch(endpoint);
        setPartner(data);
      } catch (err: any) {
        setError(extractErrorMessages(err));
      } finally {
        setLoading(false);
      }
    };
    fetchPartner();
  }, [userUid, baseUrl, apiFetch]);

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'success' : 'secondary'}>
        {isActive ? 'Actif' : 'Inactif'}
      </Badge>
    );
  };

  const getPermissionBadge = (hasPermission: boolean) => {
    return (
      <Badge variant={hasPermission ? 'success' : 'secondary'}>
        {hasPermission ? 'Oui' : 'Non'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <span className="text-gray-600 dark:text-gray-300">Chargement des détails du partenaire...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-gray-50 to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard/partner-permissions-summary">
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Retour
                </Button>
              </Link>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-green-500 bg-clip-text text-transparent">
                  Détails du partenaire
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  Informations complètes du partenaire et de ses permissions
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

        {partner && (
          <div className="space-y-6">
            {/* Partner Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700">
                <CardContent className="p-4">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3 flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Informations personnelles
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom complet:</span>
                      <p className="text-lg font-semibold text-blue-600">
                        {partner.user_info.display_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.user_info.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut:</span>
                      <div className="mt-1">
                        {getStatusBadge(partner.user_info.is_active)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700">
                <CardContent className="p-4">
                  <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-3 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Permissions
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total:</span>
                      <p className="text-lg font-semibold text-orange-600">
                        {partner.summary?.active_permissions || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total plateformes:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.summary?.total_platforms || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avec permissions:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.summary?.platforms_with_permissions || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sans permissions:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.summary?.platforms_without_permissions || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
                <CardContent className="p-4">
                  <h4 className="font-medium text-green-800 dark:text-green-300 mb-3 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Transactions
                  </h4>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total:</span>
                      <p className="text-lg font-semibold text-green-600">
                        {partner.summary?.total_platforms || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Avec permissions:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.summary?.platforms_with_permissions || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Sans permissions:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.summary?.platforms_without_permissions || 0}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions actives:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.summary?.active_permissions || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Commission Configuration */}
            {partner.commission_config && (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    <span>Configuration des commissions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux dépôt:</span>
                          <p className="text-lg font-semibold text-purple-600">
                            {partner.commission_config?.deposit_commission_rate || 0}%
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Taux retrait:</span>
                          <p className="text-lg font-semibold text-purple-600">
                            {partner.commission_config?.withdrawal_commission_rate || 0}%
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut:</span>
                          <div className="mt-1">
                            <Badge variant={partner.commission_config?.status === 'active' ? 'success' : 'secondary'}>
                              {partner.commission_config?.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Platforms with Permissions */}
            {partner.platforms_with_permissions && partner.platforms_with_permissions.length > 0 && (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <span>Plateformes avec permissions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                        {partner.platforms_with_permissions.map((platform) => (
                          <div key={platform.platform_uid} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {platform.platform_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {platform.platform_name}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                ID: {platform.platform_external_id}
                              </p>
                            </div>
                          </div>
                          <Badge variant={platform.is_active ? 'success' : 'secondary'}>
                            {platform.is_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions:</span>
                            <div className="flex space-x-2 mt-1">
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">Dépôt:</span>
                                {getPermissionBadge(platform.can_deposit)}
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="text-xs">Retrait:</span>
                                {getPermissionBadge(platform.can_withdraw)}
                              </div>
                            </div>
                          </div>
                          
                          {platform.transaction_stats && (
                            <div>
                              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statistiques:</span>
                              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                <p>Transactions: {platform.transaction_stats?.total_transactions || 0}</p>
                                <p>Réussies: {platform.transaction_stats?.successful_transactions || 0}</p>
                                <p>Montant: {(platform.transaction_stats?.total_amount || 0).toFixed(2)} FCFA</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Additional Information */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5 text-gray-600" />
                  <span>Informations supplémentaires</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">UID utilisateur:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                        {partner.user_info.uid}
                      </p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        onClick={() => {
                          navigator.clipboard.writeText(partner.user_info.uid);
                          toast({ title: "UID copié!" });
                        }}
                        aria-label="Copier l'UID"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prénom:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.user_info.first_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom:</span>
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {partner.user_info.last_name}
                      </p>
                    </div>
                </div>
              </CardContent>
            </Card>

            {/* Complete Partner Information */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span>Informations complètes du partenaire</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Users className="h-4 w-4 mr-2 text-blue-600" />
                        Informations de base
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Prénom:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                            {partner.user_info.first_name || 'Non disponible'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                            {partner.user_info.last_name || 'Non disponible'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom d'affichage:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                            {partner.user_info.display_name || 'Non disponible'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Email:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100 mt-1">
                            {partner.user_info.email || 'Non disponible'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statut du compte:</span>
                          <div className="mt-1">
                            {getStatusBadge(partner.user_info.is_active)}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Type de compte:</span>
                          <div className="mt-1">
                            <Badge variant={partner.user_info.is_partner ? 'success' : 'secondary'}>
                              {partner.user_info.is_partner ? 'Partenaire' : 'Utilisateur'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Key className="h-4 w-4 mr-2 text-purple-600" />
                        Identifiants
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">UID utilisateur:</span>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm font-mono text-gray-900 dark:text-gray-100">
                              {partner.user_info.uid || 'Non disponible'}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => {
                                navigator.clipboard.writeText(partner.user_info.uid);
                                toast({ title: "UID copié!" });
                              }}
                              aria-label="Copier l'UID"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Summary */}
                  {partner.summary && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Shield className="h-4 w-4 mr-2 text-orange-600" />
                        Résumé des plateformes et permissions
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Total plateformes</span>
                          <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
                            {partner.summary.total_platforms || 0}
                          </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">Avec permissions</span>
                          <p className="text-lg font-bold text-green-700 dark:text-green-300">
                            {partner.summary.platforms_with_permissions || 0}
                          </p>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-orange-600 dark:text-orange-400">Sans permissions</span>
                          <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
                            {partner.summary.platforms_without_permissions || 0}
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Permissions actives</span>
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {partner.summary.active_permissions || 0}
                          </p>
                        </div>
                        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">Permissions inactives</span>
                          <p className="text-lg font-bold text-red-700 dark:text-red-300">
                            {partner.summary.inactive_permissions || 0}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}


                  {/* Detailed Commission Configuration */}
                  {partner.commission_config && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-purple-600" />
                        Configuration des commissions
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Taux dépôt</span>
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {partner.commission_config.deposit_commission_rate || 0}%
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Taux retrait</span>
                          <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
                            {partner.commission_config.withdrawal_commission_rate || 0}%
                          </p>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Configuration</span>
                          <div className="mt-1">
                            <Badge variant={partner.commission_config.has_config ? 'success' : 'secondary'}>
                              {partner.commission_config.has_config ? 'Configurée' : 'Par défaut'}
                            </Badge>
                          </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                          <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Statut</span>
                          <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                            {partner.commission_config.status === 'using_defaults' ? 'Utilise les valeurs par défaut' : partner.commission_config.status}
                          </p>
                        </div>
                      </div>
                      {partner.commission_config.updated_by_name && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Dernière mise à jour:</span>
                          <p className="text-sm text-gray-900 dark:text-gray-100">
                            Par {partner.commission_config.updated_by_name} le {partner.commission_config.updated_at ? new Date(partner.commission_config.updated_at).toLocaleDateString() : 'Date inconnue'}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Platforms with Permissions */}
                  {partner.platforms_with_permissions && partner.platforms_with_permissions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-green-600" />
                        Plateformes avec permissions ({partner.platforms_with_permissions.length})
                      </h4>
                      <div className="space-y-4">
                        {partner.platforms_with_permissions.map((platform, index) => (
                          <div key={platform.platform_uid} className="border border-green-200 dark:border-green-700 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {platform.platform_name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {platform.platform_name || 'Nom non disponible'}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    ID externe: {platform.platform_external_id || 'Non disponible'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={platform.is_active ? 'success' : 'secondary'}>
                                  {platform.is_active ? 'Actif' : 'Inactif'}
                                </Badge>
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions:</span>
                                <div className="flex space-x-2 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs">Dépôt:</span>
                                    {getPermissionBadge(platform.can_deposit)}
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs">Retrait:</span>
                                    {getPermissionBadge(platform.can_withdraw)}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Limites:</span>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                                  <p>• Dépôt: {platform.min_deposit_amount} - {platform.max_deposit_amount} FCFA</p>
                                  <p>• Retrait: {platform.min_withdrawal_amount} - {platform.max_withdrawal_amount} FCFA</p>
                                </div>
                              </div>
                              
                              {platform.transaction_stats && (
                                <div>
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statistiques:</span>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                                    <p>• Total: {platform.transaction_stats.total_transactions || 0}</p>
                                    <p>• Réussies: {platform.transaction_stats.successful_transactions || 0}</p>
                                    <p>• Montant: {(platform.transaction_stats.total_amount || 0).toFixed(2)} FCFA</p>
                                    <p>• Commission: {(platform.transaction_stats.total_commission || 0).toFixed(2)} FCFA</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Platforms without Permissions */}
                  {partner.platforms_without_permissions && partner.platforms_without_permissions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-orange-600" />
                        Plateformes sans permissions ({partner.platforms_without_permissions.length})
                      </h4>
                      <div className="space-y-4">
                        {partner.platforms_without_permissions.map((platform, index) => (
                          <div key={platform.platform_uid} className="border border-orange-200 dark:border-orange-700 rounded-lg p-4 bg-orange-50 dark:bg-orange-900/20">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                  {platform.platform_name?.charAt(0)?.toUpperCase() || 'P'}
                                </div>
                                <div>
                                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                                    {platform.platform_name || 'Nom non disponible'}
                                  </h5>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    ID externe: {platform.platform_external_id || 'Non disponible'}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={platform.platform_is_active ? 'success' : 'secondary'}>
                                  {platform.platform_is_active ? 'Plateforme active' : 'Plateforme inactive'}
                                </Badge>
                                <span className="text-xs text-gray-500">#{index + 1}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Permissions:</span>
                                <div className="flex space-x-2 mt-1">
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs">Dépôt:</span>
                                    {getPermissionBadge(platform.can_deposit)}
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <span className="text-xs">Retrait:</span>
                                    {getPermissionBadge(platform.can_withdraw)}
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Limites:</span>
                                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                                  <p>• Dépôt: {platform.min_deposit_amount} - {platform.max_deposit_amount} FCFA</p>
                                  <p>• Retrait: {platform.min_withdrawal_amount} - {platform.max_withdrawal_amount} FCFA</p>
                                </div>
                              </div>
                              
                              {platform.transaction_stats && (
                                <div>
                                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Statistiques:</span>
                                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1 space-y-1">
                                    <p>• Total: {platform.transaction_stats.total_transactions || 0}</p>
                                    <p>• Réussies: {platform.transaction_stats.successful_transactions || 0}</p>
                                    <p>• Montant: {(platform.transaction_stats.total_amount || 0).toFixed(2)} FCFA</p>
                                    <p>• Commission: {(platform.transaction_stats.total_commission || 0).toFixed(2)} FCFA</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

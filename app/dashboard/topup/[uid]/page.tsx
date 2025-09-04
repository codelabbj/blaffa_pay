"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/providers/language-provider";
import { useToast } from "@/hooks/use-toast";
import { useApi } from "@/lib/useApi";
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { ArrowLeft, DollarSign, User, Mail, Calendar, Clock, FileText, CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function TopupDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const [topup, setTopup] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { t } = useLanguage();
  const { toast } = useToast();
  const apiFetch = useApi();
  const [proofImageModalOpen, setProofImageModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError("");
      try {
        const endpoint = `/api/payments/recharge-requests/${uid}/`;
        const data = await apiFetch(endpoint);
        setTopup(data);
      } catch (err: any) {
        setError(extractErrorMessages(err));
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [uid, apiFetch]);

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { color: string; icon: any } } = {
      'pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300', icon: Clock },
      'approved': { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300', icon: CheckCircle },
      'rejected': { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300', icon: XCircle },
      'completed': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300', icon: CheckCircle },
      'expired': { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300', icon: XCircle }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || statusMap['pending'];
    const IconComponent = statusInfo.icon;
    
    return (
      <Badge className={statusInfo.color}>
        <div className="flex items-center space-x-1">
          <IconComponent className="h-3 w-3" />
          <span className="capitalize">{status}</span>
        </div>
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="text-gray-600 dark:text-gray-300">Loading topup details...</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
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
                Back
              </Button>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {t("topup.details") || "Top Up Details"}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                  View detailed information about this topup request
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

        {topup && (
          <div className="space-y-6">
            {/* Topup Overview */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-300" />
                  </div>
                  <span>Topup Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {topup.formatted_amount || `$${topup.amount}`}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400">UID: {topup.uid}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(topup.status_display || topup.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* User Information */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <span>User Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Name</p>
                      <p className="text-gray-900 dark:text-gray-100">{topup.user_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">User Email</p>
                      <p className="text-gray-900 dark:text-gray-100">{topup.user_email}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transaction Details */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-300" />
                  </div>
                  <span>Transaction Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount</p>
                      <p className="text-gray-900 dark:text-gray-100">{topup.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reference</p>
                      <p className="text-gray-900 dark:text-gray-100">{topup.reference}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Transaction Reference</p>
                      <p className="text-gray-900 dark:text-gray-100">{topup.account_transaction_reference || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Proof Description</p>
                      <p className="text-gray-900 dark:text-gray-100">{topup.proof_description || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline Information */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-300" />
                  </div>
                  <span>Timeline Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Created At</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {topup.created_at ? new Date(topup.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expires At</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {topup.expires_at ? new Date(topup.expires_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transaction Date</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {topup.transaction_date ? new Date(topup.transaction_date).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reviewed At</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {topup.reviewed_at ? new Date(topup.reviewed_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Processed At</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {topup.processed_at ? new Date(topup.processed_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Remaining</p>
                      <p className="text-gray-900 dark:text-gray-100">
                        {topup.time_remaining ? `${topup.time_remaining} seconds` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Information */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-300" />
                  </div>
                  <span>Status Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Can Submit Proof</p>
                      <Badge variant={topup.can_submit_proof ? "default" : "secondary"}>
                        {topup.can_submit_proof ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Can Be Reviewed</p>
                      <Badge variant={topup.can_be_reviewed ? "default" : "secondary"}>
                        {topup.can_be_reviewed ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <XCircle className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expired</p>
                      <Badge variant={topup.is_expired ? "destructive" : "secondary"}>
                        {topup.is_expired ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Reviewed By</p>
                      <p className="text-gray-900 dark:text-gray-100">{topup.reviewed_by_name || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proof Image */}
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
              <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                <CardTitle className="flex items-center space-x-2">
                  <div className="p-2 bg-pink-100 dark:bg-pink-900 rounded-lg">
                    <Eye className="h-5 w-5 text-pink-600 dark:text-pink-300" />
                  </div>
                  <span>Proof Image</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {topup.proof_image ? (
                  <div className="flex items-center space-x-4">
                    <Button
                      onClick={() => setProofImageModalOpen(true)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      {t("topup.viewProof") || "View Image"}
                    </Button>
                    <Dialog open={proofImageModalOpen} onOpenChange={setProofImageModalOpen}>
                      <DialogContent className="flex flex-col items-center justify-center">
                        <DialogHeader>
                          <DialogTitle className="flex items-center space-x-2">
                            <Eye className="h-5 w-5" />
                            <span>{t("topup.proofImage") || "Proof Image"}</span>
                          </DialogTitle>
                        </DialogHeader>
                        <img
                          src={topup.proof_image}
                          alt={t("topup.proofImageAlt") || "Proof"}
                          className="max-w-full max-h-[70vh] rounded border"
                          style={{ objectFit: "contain" }}
                        />
                        <DialogClose asChild>
                          <Button className="mt-4 w-full">Close</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Eye className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">{t("topup.noProofImage") || "No proof image available"}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            {(topup.admin_notes || topup.rejection_reason) && (
              <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                <CardHeader className="border-b border-gray-100 dark:border-gray-700">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                      <FileText className="h-5 w-5 text-red-600 dark:text-red-300" />
                    </div>
                    <span>Admin Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {topup.admin_notes && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Admin Notes</p>
                        <p className="text-gray-900 dark:text-gray-100">{topup.admin_notes}</p>
                      </div>
                    )}
                    {topup.rejection_reason && (
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Rejection Reason</p>
                        <p className="text-red-600 dark:text-red-400">{topup.rejection_reason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
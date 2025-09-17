"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Edit, Save, X, User, Mail, Phone, Shield, Calendar, CheckCircle, XCircle } from 'lucide-react';

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

interface UserProfile {
  uid: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  email_verified: boolean;
  phone_verified: boolean;
  display_name: string;
  is_verified: boolean;
  contact_method: string;
  created_at: string;
  updated_at: string;
}

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();

  // Get token from localStorage (same as sign-in-form and dashboard layout)
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("accessToken") || "";
  }

  useEffect(() => {
    // Redirect if not logged in (no token)
    if (!token) {
      router.push("/login");
      return;
    }
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${baseUrl}api/auth/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch profile');
        const data = await response.json();
        setProfile(data);
        setFormData({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone,
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Erreur',
          description: 'Échec du chargement des données du profil',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast, router, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/profile/', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update profile');

      const updatedProfile = await response.json();
      setProfile(updatedProfile);

      setEditing(false);
      toast({
        title: 'Succès',
        description: 'Profil mis à jour avec succès',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Erreur',
        description: 'Échec de la mise à jour du profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Skeleton className="h-12 w-1/3 mb-6" />
          <div className="grid gap-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="h-12 w-12 text-red-500" />
            <p className="text-lg text-gray-600 dark:text-gray-300">Échec du chargement du profil. Veuillez réessayer plus tard.</p>
          </div>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Mon profil
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                Gérez vos informations de compte et paramètres
              </p>
            </div>
            {!editing ? (
              <Button 
                onClick={() => setEditing(true)} 
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                Modifier le profil
              </Button>
            ) : (
              <div className="space-x-2">
                <Button 
                  onClick={() => setEditing(false)} 
                  variant="outline" 
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  Annuler
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Sauvegarder les modifications
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <CardTitle className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src="" alt={profile.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                  {getInitials(profile.display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">{profile.display_name}</div>
                <div className="text-gray-600 dark:text-gray-400 mt-1">
                  Membre depuis {new Date(profile.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge 
                    variant={profile.is_active ? "default" : "secondary"}
                    className={
                      profile.is_active 
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                        : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                    }
                  >
                    <div className="flex items-center space-x-1">
                      {profile.is_active ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>{profile.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
                  </div>
                  <span>Informations personnelles</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Prénom</Label>
                    {editing ? (
                      <Input
                        id="first_name"
                        name="first_name"
                        value={formData.first_name || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="text-gray-900 dark:text-gray-100 font-medium">{profile.first_name}</div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Nom de famille</Label>
                    {editing ? (
                      <Input
                        id="last_name"
                        name="last_name"
                        value={formData.last_name || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="text-gray-900 dark:text-gray-100 font-medium">{profile.last_name}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Mail className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                  <span>Informations de contact</span>
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Adresse e-mail</span>
                    </Label>
                    {editing ? (
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{profile.email}</span>
                        {profile.email_verified ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Vérifié</span>
                            </div>
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                            <div className="flex items-center space-x-1">
                              <XCircle className="h-3 w-3" />
                              <span>Non vérifié</span>
                            </div>
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Phone className="h-4 w-4" />
                      <span>Numéro de téléphone</span>
                    </Label>
                    {editing ? (
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        disabled={loading}
                        className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                      />
                    ) : (
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-900 dark:text-gray-100 font-medium">{profile.phone}</span>
                        {profile.phone_verified ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                            <div className="flex items-center space-x-1">
                              <CheckCircle className="h-3 w-3" />
                              <span>Vérifié</span>
                            </div>
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                            <div className="flex items-center space-x-1">
                              <XCircle className="h-3 w-3" />
                              <span>Non vérifié</span>
                            </div>
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Settings */}
              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Shield className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                  </div>
                  <span>Paramètres du compte</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Statut du compte</div>
                    <Badge 
                      variant={profile.is_active ? "default" : "secondary"}
                      className={
                        profile.is_active 
                          ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" 
                          : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                      }
                    >
                      <div className="flex items-center space-x-1">
                        {profile.is_active ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        <span>{profile.is_active ? 'Actif' : 'Inactif'}</span>
                      </div>
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Méthode de contact préférée</div>
                    <Badge className="bg-blue-100 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300">
                      <div className="flex items-center space-x-1">
                        {profile.contact_method === 'email' ? (
                          <Mail className="h-3 w-3" />
                        ) : (
                          <Phone className="h-3 w-3" />
                        )}
                        <span>{profile.contact_method === 'email' ? 'E-mail' : 'Téléphone'}</span>
                      </div>
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center space-x-2">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Calendar className="h-4 w-4 text-orange-600 dark:text-orange-300" />
                  </div>
                  <span>Informations du compte</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">ID utilisateur</div>
                    <div className="text-gray-900 dark:text-gray-100 font-mono text-sm">{profile.uid}</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Dernière mise à jour</div>
                    <div className="text-gray-900 dark:text-gray-100">
                      {new Date(profile.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
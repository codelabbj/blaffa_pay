"use client"

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./api";
import { toast } from "@/hooks/use-toast";

// Helper function to get access token from both localStorage and cookies
function getAccessTokenFromStorage() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

// Helper function to get access token from cookies
function getAccessTokenFromCookie() {
  if (typeof document === 'undefined') return null;
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'accessToken') {
      return value;
    }
  }
  return null;
}

export function useApi() {
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";

  const refreshAccessToken = useCallback(async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      console.log('No refresh token available');
      throw new Error('No refresh token available');
    }
    
    try {
      const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.log('Refresh token request failed:', res.status, errorData);
        throw new Error(errorData?.detail || 'Refresh token invalid');
      }
      
      const data = await res.json();
      if (!data.access) {
        console.log('No access token in refresh response');
        throw new Error('No access token in refresh response');
      }
      
      setTokens({ access: data.access, refresh });
      console.log('Token refreshed successfully');
      return data.access;
    } catch (error) {
      console.log('Refresh token error:', error);
      throw error;
    }
  }, [baseUrl]);

  const clearAllAuth = useCallback(() => {
    clearTokens();
    // Remove accessToken cookie
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
  }, []);

  const apiFetch = useCallback(async (input: RequestInfo, init: RequestInit & { showSuccessToast?: boolean; successMessage?: string } = {}) => {
    // Try to get access token from both localStorage and cookies
    let accessToken = getAccessTokenFromStorage() || getAccessTokenFromCookie();
    
    // Extract showSuccessToast option and remove it from init
    const { showSuccessToast = true, successMessage, ...fetchInit } = init;
    
    // Attach access token if available
    const headers = new Headers(fetchInit.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    
    // Determine HTTP method
    // IMPORTANT: GET requests never show success toasts
    let method = 'GET'; // Default to GET
    
    // Check if method is specified in fetchInit (most common case)
    if (fetchInit.method) {
      method = String(fetchInit.method).trim().toUpperCase();
    } 
    // If input is a Request object, check its method property
    else if (typeof input === 'object' && input !== null && 'method' in input && input.method) {
      method = String(input.method).trim().toUpperCase();
    }
    
    // Ensure method is valid - default to GET if empty or invalid
    if (!method || (method !== 'GET' && method !== 'POST' && method !== 'PUT' && method !== 'PATCH' && method !== 'DELETE')) {
      method = 'GET';
    }
    
    // CRITICAL: Never show success toasts for GET requests, regardless of other settings
    const shouldShowSuccessToast = showSuccessToast && method !== 'GET';
    
    // Debug log to help identify issues (can be removed in production)
    if (process.env.NODE_ENV === 'development' && method === 'GET') {
      console.log('[useApi] GET request detected - success toast will NOT be shown');
    }
    
    let res = await fetch(input, { ...fetchInit, headers });
    let data;
    
    try {
      data = await res.clone().json();
    } catch (e) {
      // If not JSON, just return the response without showing any toast
      // Success toasts will only show for JSON responses below
      return res;
    }
    
    // If token is invalid/expired, try to refresh and retry once
    if (data?.code === 'token_not_valid' || res.status === 401) {
      try {
        console.log('Token expired, attempting refresh...');
        accessToken = await refreshAccessToken();
        headers.set('Authorization', `Bearer ${accessToken}`);
        
        // Retry the original request with new token
        res = await fetch(input, { ...fetchInit, headers });
        try {
          data = await res.clone().json();
        } catch (e) {
          // If not JSON, just return the response without showing any toast
          // Success toasts will only show for JSON responses below
          return res;
        }
        
        // If still unauthorized after refresh, force logout
        if (data?.code === 'token_not_valid' || res.status === 401) {
          console.log('Token refresh failed, logging out...');
          clearAllAuth();
          router.push('/');
          throw new Error('Authentication failed after token refresh');
        }
      } catch (refreshErr) {
        console.log('Token refresh error:', refreshErr);
        clearAllAuth();
        router.push('/');
        throw new Error('Token refresh failed');
      }
    }
    
    // If the response is an error, throw it so it can be handled by the calling component
    if (!res.ok) {
      // Throw the full data object so error extraction works for non_field_errors and other fields
      throw data;
    }
    
    // Show success toast for successful non-GET requests only
    // FINAL SAFETY CHECK: Never show toasts for GET requests under any circumstances
    if (shouldShowSuccessToast && res.ok && method !== 'GET') {
      // Double-check method is not GET (extra safety)
      if (method === 'GET') {
        console.warn('[useApi] Attempted to show success toast for GET request - this should never happen!');
        return data;
      }
      
      // Generate default success message based on method if not provided
      let defaultMessage = "Opération réussie";
      if (!successMessage) {
        switch (method) {
          case 'POST':
            defaultMessage = "Créé avec succès";
            break;
          case 'PUT':
          case 'PATCH':
            defaultMessage = "Mis à jour avec succès";
            break;
          case 'DELETE':
            defaultMessage = "Supprimé avec succès";
            break;
          default:
            defaultMessage = "Opération réussie";
        }
      }
      
      // Show toast immediately
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log('[useApi] Showing success toast for', method, 'request:', successMessage || defaultMessage);
        }
        toast({
          title: "Succès",
          description: successMessage || defaultMessage,
          variant: "success",
        });
      } catch (toastError) {
        console.error('[useApi] Failed to show success toast:', toastError);
      }
    }
    
    return data;
  }, [refreshAccessToken, clearAllAuth, router]);

  return apiFetch;
}
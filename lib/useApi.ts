"use client"

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./api";
import { apiUrl, resolveApiUrl } from "./env-config";
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

  const refreshAccessToken = useCallback(async () => {
    const refresh = getRefreshToken();
    if (!refresh) {
      console.log('No refresh token available');
      throw new Error('No refresh token available');
    }

    try {
      const res = await fetch(apiUrl("api/auth/token/refresh/"), {
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

      // ROTATE_REFRESH_TOKENS : le nouveau refresh doit remplacer l'ancien (blacklist).
      setTokens({ access: data.access, refresh: data.refresh || refresh });
      console.log('Token refreshed successfully');
      return data.access;
    } catch (error) {
      console.log('Refresh token error:', error);
      throw error;
    }
  }, []);

  const clearAllAuth = useCallback(() => {
    clearTokens();
  }, []);

  const apiFetch = useCallback(async (input: RequestInfo, init: RequestInit & { showSuccessToast?: boolean; successMessage?: string } = {}) => {
    const resolvedInput: RequestInfo =
      typeof input === "string"
        ? resolveApiUrl(input)
        : input instanceof Request
          ? new Request(resolveApiUrl(input.url), input)
          : input

    // Try to get access token from both localStorage and cookies
    let accessToken = getAccessTokenFromStorage() || getAccessTokenFromCookie();

    // Extract showSuccessToast option and remove it from init
    const { showSuccessToast = true, successMessage, ...fetchInit } = init;

    // Determine if we should attach the access token
    // We don't want to send tokens for auth-related public endpoints (login, password reset)
    // as an invalid/expired token might cause the backend to reject the request
    const urlString = typeof resolvedInput === 'string' ? resolvedInput : (resolvedInput instanceof Request ? resolvedInput.url : '');
    const isPublicAuthEndpoint = urlString.includes('/api/auth/login/') || 
                                  urlString.includes('/api/auth/password-reset/');

    // Attach access token if available
    const headers = new Headers(fetchInit.headers || {});
    if (accessToken && !isPublicAuthEndpoint) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }

    // Automatically set Content-Type for JSON requests if body is present
    if (fetchInit.body && !headers.has('Content-Type')) {
      // Check if body is NOT FormData (which should have its own boundary headers)
      if (!(fetchInit.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
      }
    }

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

    const parseBody = async (response: Response) => {
      try {
        return await response.clone().json();
      } catch {
        return undefined;
      }
    };

    let res = await fetch(resolvedInput, { ...fetchInit, headers });
    let data = await parseBody(res);

    const isUnauthorized = (response: Response, body: any) =>
      response.status === 401 || body?.code === "token_not_valid";

    // Refresh AVANT de throw : le throw précoce empêchait tout refresh.
    if (isUnauthorized(res, data) && !isPublicAuthEndpoint) {
      try {
        console.log("Token expired, attempting refresh...");
        accessToken = await refreshAccessToken();
        headers.set("Authorization", `Bearer ${accessToken}`);
        res = await fetch(resolvedInput, { ...fetchInit, headers });
        data = await parseBody(res);
        if (isUnauthorized(res, data)) {
          console.log("Token refresh failed, logging out...");
          clearAllAuth();
          router.push("/");
          throw new Error("Authentication failed after token refresh");
        }
      } catch (refreshErr) {
        if (refreshErr instanceof Error && refreshErr.message.startsWith("Authentication failed")) {
          throw refreshErr;
        }
        console.log("Token refresh error:", refreshErr);
        clearAllAuth();
        router.push("/");
        throw new Error("Token refresh failed");
      }
    }

    if (!res.ok) {
      if (data !== undefined) throw data;
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    if (data === undefined) {
      return res;
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
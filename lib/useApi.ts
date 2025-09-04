"use client"

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./api";

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

  const apiFetch = useCallback(async (input: RequestInfo, init: RequestInit = {}) => {
    // Try to get access token from both localStorage and cookies
    let accessToken = getAccessTokenFromStorage() || getAccessTokenFromCookie();
    
    // Attach access token if available
    const headers = new Headers(init.headers || {});
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
    
    let res = await fetch(input, { ...init, headers });
    let data;
    
    try {
      data = await res.clone().json();
    } catch (e) {
      // If not JSON, just return the response
      return res;
    }
    
    // If token is invalid/expired, try to refresh and retry once
    if (data?.code === 'token_not_valid' || res.status === 401) {
      try {
        console.log('Token expired, attempting refresh...');
        accessToken = await refreshAccessToken();
        headers.set('Authorization', `Bearer ${accessToken}`);
        
        // Retry the original request with new token
        res = await fetch(input, { ...init, headers });
        try {
          data = await res.clone().json();
        } catch (e) {
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
    
    return data;
  }, [refreshAccessToken, clearAllAuth, router]);

  return apiFetch;
}
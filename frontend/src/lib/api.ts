/**
 * Authorized API Fetch Helper
 * Handles authenticated requests and token refresh on 401 errors
 */

import { getToken, clearAuth } from "@/lib/auth";

interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
  const token = getToken();
  const url = endpoint.startsWith("http") ? endpoint : `${API_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If unauthorized, clear auth and let the AuthProvider handle redirect
  if (response.status === 401) {
    clearAuth();
    // Force a page reload to trigger AuthProvider re-check
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  return response;
}

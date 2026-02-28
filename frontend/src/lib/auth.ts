/**
 * Auth Helper Functions
 * Handles token validation and authentication checks
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function validateToken(token: string): Promise<boolean> {
  if (!token) return false;

  try {
    const response = await fetch(`${API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.ok;
  } catch (err) {
    console.error("Token validation error:", err);
    return false;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("wa_token");
}

export function getUser() {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("wa_user");
  return user ? JSON.parse(user) : null;
}

export function setToken(token: string) {
  localStorage.setItem("wa_token", token);
}

export function setUser(user: any) {
  localStorage.setItem("wa_user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("wa_token");
  localStorage.removeItem("wa_user");
}

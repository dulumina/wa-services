"use client";

import React, { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { validateToken, getToken, clearAuth } from "@/lib/auth";
import { AuthContext } from "@/lib/authContext";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const checkAuth = async () => {
      const token = getToken();

      if (!token) {
        // No token, redirect to login if not already on auth page
        if (!isAuthPage) {
          router.push("/login");
        }
        setIsAuthenticated(false);
      } else {
        // Token exists, validate it with backend
        const isValid = await validateToken(token);

        if (isValid) {
          // Token is valid
          setIsAuthenticated(true);

          // Redirect from login to dashboard if authenticated
          if (isAuthPage) {
            router.push("/");
          }
        } else {
          // Token is invalid, clear auth and redirect to login
          clearAuth();
          setIsAuthenticated(false);

          if (!isAuthPage) {
            router.push("/login");
          }
        }
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router, isAuthPage]);

  // Don't render until auth check is complete
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--bg-primary)",
        }}
      >
        <div
          className="animate-spin"
          style={{
            width: "2rem",
            height: "2rem",
            border: "3px solid var(--accent-primary)",
            borderTopColor: "transparent",
            borderRadius: "50%",
          }}
        ></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

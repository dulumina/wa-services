"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/register";

  useEffect(() => {
    const token = localStorage.getItem("wa_token");

    if (!token && !isAuthPage) {
      router.push("/login");
    } else if (token && isAuthPage) {
      router.push("/");
    } else {
      setIsReady(true);
    }
  }, [pathname, router, isAuthPage]);

  // Prevent flickering of protected content while checking auth
  if (!isReady && !isAuthPage) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="animate-spin" style={{ width: '2rem', height: '2rem', border: '3px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%' }}></div>
      </div>
    );
  }

  return (
    <main className="main-content" style={isAuthPage ? { marginLeft: 0, padding: 0 } : {}}>
      {children}
    </main>
  );
}

"use client";

import { usePathname } from "next/navigation";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <main className="main-content" style={isAuthPage ? { marginLeft: 0, padding: 0 } : {}}>
      {children}
    </main>
  );
}

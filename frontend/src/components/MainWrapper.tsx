"use client";

import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const mainRef = useRef<HTMLMainElement>(null);

  // Close sidebar when pathname changes (user navigates)
  useEffect(() => {
    const closeSidebar = () => {
      const layout = document.querySelector(".dashboard-layout");
      const sidebar = document.querySelector(".sidebar");
      if (layout?.classList.contains("sidebar-open")) {
        layout.classList.remove("sidebar-open");
      }
      if (sidebar?.classList.contains("open")) {
        sidebar.classList.remove("open");
      }
    };
    closeSidebar();
  }, [pathname]);

  useEffect(() => {
    const handleMainClick = (e: Event) => {
      // Only close sidebar if clicking directly on mainRef, not on nested elements with their own handlers
      if (e.target === mainRef.current) {
        const layout = document.querySelector(".dashboard-layout");
        const sidebar = document.querySelector(".sidebar");
        if (layout?.classList.contains("sidebar-open")) {
          layout.classList.remove("sidebar-open");
          sidebar?.classList.remove("open");
        }
      }
    };

    const mainElement = mainRef.current;
    if (mainElement && !isAuthPage) {
      // Use capture phase to detect clicks on main area
      mainElement.addEventListener("click", handleMainClick, true);
      return () => {
        mainElement.removeEventListener("click", handleMainClick, true);
      };
    }
  }, [isAuthPage]);

  return (
    <main
      className="main-content"
      ref={mainRef}
      style={isAuthPage ? { marginLeft: 0, padding: 0 } : {}}
    >
      {children}
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Smartphone, Key, Activity, Settings, LogOut, FileText } from "lucide-react";
import { getToken, clearAuth } from "@/lib/auth";
import { useAuth } from "@/lib/authContext";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render sidebar if mounted and authenticated
  if (!mounted || pathname === "/login" || pathname === "/register" || !isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const handleNavClick = () => {
    // Close sidebar on mobile when nav item is clicked
    const layout = document.querySelector(".dashboard-layout");
    const sidebar = document.querySelector(".sidebar");
    if (layout?.classList.contains("sidebar-open")) {
      layout.classList.remove("sidebar-open");
    }
    if (sidebar?.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Devices", href: "/devices", icon: Smartphone },
    { name: "API Keys", href: "/api-keys", icon: Key },
    { name: "Webhooks", href: "/webhooks", icon: Settings },
    { name: "Message Logs", href: "/logs", icon: LayoutDashboard },
    { name: "Monitoring", href: "/status", icon: Activity },
    { name: "API Docs", href: "/api-docs", icon: FileText },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <Activity className="text-accent" />
        <span>WhatsApp API</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item ${isActive ? "active" : ""}`}
              onClick={handleNavClick}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <button
          className="nav-item"
          onClick={() => {
            handleNavClick();
            handleLogout();
          }}
          style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

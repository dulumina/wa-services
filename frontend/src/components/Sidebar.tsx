"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Smartphone, Key, Activity, Settings, LogOut, FileText } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const token = typeof window !== 'undefined' ? localStorage.getItem("wa_token") : null;
  if (pathname === "/login" || pathname === "/register" || !token) return null;

  const handleLogout = () => {
    localStorage.removeItem("wa_token");
    localStorage.removeItem("wa_user");
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Devices", href: "/devices", icon: Smartphone },
    { name: "API Keys", href: "/api-keys", icon: Key },
    { name: "Webhooks", href: "/webhooks", icon: Settings },
    { name: "Message Logs", href: "/logs", icon: LayoutDashboard },
    { name: "Monitoring", href: "/status", icon: Activity },
    { name: "API Docs", href: "http://localhost:8000/api-docs", icon: FileText },
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
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
        <button className="nav-item" onClick={handleLogout} style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

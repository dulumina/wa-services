"use client";

import { useState, useEffect } from "react";
import { Activity, Smartphone, Key, AlertCircle, RefreshCcw } from "lucide-react";

type Stat = {
  label: string;
  value: string | number;
  icon: any;
  type: "success" | "info" | "warning" | "danger";
};

type ActivityLog = {
  id: string;
  event: string;
  device: string;
  status: string;
  time: string;
};

export default function Home() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(`${apiUrl}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const { stats: s, recentActivity: ra } = result.data;

        setStats([
          { label: "Active Devices", value: s.activeDevices, icon: Smartphone, type: "success" },
          { label: "API Keys", value: s.apiKeys, icon: Key, type: "info" },
          { label: "Messages Sent (Today)", value: s.messagesSentToday.toLocaleString(), icon: Activity, type: "info" },
          { label: "Failed Items (Today)", value: s.failedItems, icon: AlertCircle, type: "warning" }
        ]);
        setRecentActivity(ra);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', padding: '5rem' }}>
        <RefreshCcw size={40} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1 className="header-title">Dashboard Overview</h1>
          <p className="header-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
      </div>

      <div className="grid-cards">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card glass-panel stat-card">
              <div className={`stat-icon ${stat.type}`}>
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', marginTop: '2rem' }}>
        <div className="card glass-panel" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3 className="card-title">Recent Activity</h3>
            <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>Refresh</button>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Device</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.event}</td>
                    <td><span className="badge badge-info">{activity.device}</span></td>
                    <td>
                      <span className={`badge badge-${activity.status === 'failed' ? 'danger' : 'success'}`}>
                        {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-secondary">{formatRelativeTime(activity.time)}</td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                      No recent activity found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

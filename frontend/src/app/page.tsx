import { Activity, Smartphone, Key, AlertCircle } from "lucide-react";

export default function Home() {
  const stats = [
    { label: "Active Devices", value: "3", icon: Smartphone, type: "success" as const },
    { label: "API Keys", value: "5", icon: Key, type: "info" as const },
    { label: "Messages Sent (Today)", value: "1,248", icon: Activity, type: "info" as const },
    { label: "Failed Items", value: "12", icon: AlertCircle, type: "warning" as const }
  ];

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
            <button className="btn btn-secondary btn-sm">View All</button>
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
                <tr>
                  <td>Message Sent</td>
                  <td>Main-Marketing</td>
                  <td><span className="badge badge-success">Success</span></td>
                  <td className="text-secondary">2 mins ago</td>
                </tr>
                <tr>
                  <td>Webhook Triggered</td>
                  <td>Support-Bot</td>
                  <td><span className="badge badge-success">Success</span></td>
                  <td className="text-secondary">15 mins ago</td>
                </tr>
                <tr>
                  <td>API Key Created</td>
                  <td>System</td>
                  <td><span className="badge badge-info">Info</span></td>
                  <td className="text-secondary">1 hour ago</td>
                </tr>
                <tr>
                  <td>Device Disconnected</td>
                  <td>Main-Marketing</td>
                  <td><span className="badge badge-warning">Warning</span></td>
                  <td className="text-secondary">2 hours ago</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

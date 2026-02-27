"use client";

import { useEffect, useState } from "react";
import io from "socket.io-client";
import { Activity, Wifi, WifiOff, RefreshCcw, Bell } from "lucide-react";

type LogEntry = {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
};

export default function StatusPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [deviceStatuses, setDeviceStatuses] = useState<Record<string, string>>({});

  useEffect(() => {
    // Connect to the WA Services backend
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";
    const socket = io(socketUrl);

    socket.on("connect", () => {
      setIsConnected(true);
      addLog("info", "Connected to WA Services Event Stream");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      addLog("error", "Disconnected from backend server");
    });

    // Listen to device specific events (adjust to match your backend events)
    socket.on("message", (msg) => {
      addLog("info", `Server message: ${JSON.stringify(msg)}`);
    });

    socket.on("qr", (data) => {
      addLog("warning", `QR Code received for device: ${data.id}`);
      setDeviceStatuses(prev => ({ ...prev, [data.id]: "AWAITING QR SCAN" }));
    });

    socket.on("ready", (data) => {
      addLog("success", `Device ${data.id} is ready`);
      setDeviceStatuses(prev => ({ ...prev, [data.id]: "CONNECTED" }));
    });

    socket.on("authenticated", (data) => {
      addLog("success", `Device ${data.id} authenticated`);
      setDeviceStatuses(prev => ({ ...prev, [data.id]: "AUTHENTICATED" }));
    });

    socket.on("disconnected", (data) => {
      addLog("error", `Device ${data.id} disconnected`);
      setDeviceStatuses(prev => ({ ...prev, [data.id]: "DISCONNECTED" }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const addLog = (type: LogEntry['type'], message: string) => {
    setLogs(prev => [{
      id: Math.random().toString(36).substring(7),
      time: new Date().toLocaleTimeString(),
      type,
      message
    }, ...prev].slice(0, 100)); // Keep last 100 logs
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 4rem)' }}>
      <div className="header" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="header-title">Connection Status</h1>
          <p className="header-subtitle">Real-time socket monitoring for WhatsApp devices.</p>
        </div>
        <div className={`badge ${isConnected ? 'badge-success' : 'badge-danger'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
          {isConnected ? <Wifi size={16} /> : <WifiOff size={16} />}
          <span>{isConnected ? "Event Stream Connected" : "Disconnected"}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 300px', gap: '1.5rem', flex: 1, minHeight: 0 }}>

        {/* Logs Viewer */}
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '1rem 1.5rem', marginBottom: 0, borderBottom: '1px solid var(--glass-border)', background: 'var(--bg-tertiary)' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} className="text-accent" />
              Live Activity Logs
            </h3>
            <button className="btn btn-secondary btn-sm" onClick={clearLogs}>
              <RefreshCcw size={14} /> Clear
            </button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: '#0f172a', color: '#f8fafc', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {logs.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', gap: '1rem' }}>
                <Bell size={32} opacity={0.5} />
                <p>Waiting for events...</p>
              </div>
            ) : (
              logs.map(log => (
                <div key={log.id} style={{ marginBottom: '0.5rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #1e293b', paddingBottom: '0.5rem' }}>
                  <span style={{ color: '#64748b', whiteSpace: 'nowrap' }}>[{log.time}]</span>
                  <span style={{
                    color: log.type === 'error' ? '#ef4444' :
                      log.type === 'success' ? '#10b981' :
                        log.type === 'warning' ? '#f59e0b' : '#3b82f6',
                    textTransform: 'uppercase',
                    width: '60px'
                  }}>{log.type}</span>
                  <span style={{ wordBreak: 'break-all' }}>{log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Known Devices */}
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header" style={{ marginBottom: '1rem' }}>
            <h3 className="card-title">Device States</h3>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {Object.keys(deviceStatuses).length === 0 ? (
              <p className="text-muted text-center" style={{ marginTop: '2rem' }}>No devices detected in current session.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {Object.entries(deviceStatuses).map(([id, status]) => (
                  <div key={id} style={{ padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--glass-border)' }}>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{id}</div>
                    <div className="badge" style={{
                      background: status === 'CONNECTED' || status === 'AUTHENTICATED' ? 'var(--success-bg)' : status.includes('QR') ? 'var(--warning-bg)' : 'var(--danger-bg)',
                      color: status === 'CONNECTED' || status === 'AUTHENTICATED' ? 'var(--success)' : status.includes('QR') ? 'var(--warning)' : 'var(--danger)',
                    }}>
                      {status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

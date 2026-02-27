"use client";

import { useState, useEffect } from "react";
import { Plus, Smartphone, Trash2, RefreshCcw, QrCode } from "lucide-react";
import { io, Socket } from "socket.io-client";

type DeviceSession = {
  id: string;
  description: string;
  ready: boolean;
  statusText?: string;
  qrUrl?: string;
  logs: string[];
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceSession[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newDevice, setNewDevice] = useState({ id: "", description: "" });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

      const response = await fetch(`${apiUrl}/api/devices`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        const mappedDevices = result.data.map((device: any) => ({
          id: device.id,
          description: device.description || "",
          ready: device.ready,
          statusText: device.ready ? "Whatsapp is ready!" : "Initialized",
          logs: [device.ready ? "Whatsapp is ready!" : "Initialized"]
        }));
        setDevices(mappedDevices);
      }
    } catch (err) {
      console.error("Failed to fetch devices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";
    const token = localStorage.getItem("wa_token");
    const newSocket = io(socketUrl, {
      auth: { token }
    });
    setSocket(newSocket);

    newSocket.on("init", (data: any[]) => {
      // Refresh or update based on socket data
      const initializedDevices = data.map(session => ({
        id: session.id,
        description: session.description || "",
        ready: session.ready,
        statusText: session.ready ? "Whatsapp is ready!" : "Connecting...",
        logs: [session.ready ? "Whatsapp is ready!" : "Connecting..."]
      }));
      setDevices(initializedDevices);
    });

    newSocket.on("remove-session", (id: string) => {
      setDevices(prev => prev.filter(d => d.id !== id));
    });

    newSocket.on("message", (data: { id: string, text: string }) => {
      setDevices(prev => prev.map(d =>
        d.id === data.id ? { ...d, statusText: data.text, logs: [data.text, ...d.logs].slice(0, 50) } : d
      ));
    });

    newSocket.on("qr", (data: { id: string, src: string }) => {
      setDevices(prev => prev.map(d =>
        d.id === data.id ? { ...d, qrUrl: data.src, statusText: "QR Code received, waiting for scan..." } : d
      ));
    });

    newSocket.on("ready", (data: { id: string }) => {
      setDevices(prev => prev.map(d =>
        d.id === data.id ? { ...d, ready: true, qrUrl: undefined, statusText: "Whatsapp is ready!" } : d
      ));
    });

    newSocket.on("authenticated", (data: { id: string }) => {
      setDevices(prev => prev.map(d =>
        d.id === data.id ? { ...d, qrUrl: undefined, statusText: "Authenticated successfully!" } : d
      ));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newDevice.id && socket) {
      try {
        const token = localStorage.getItem("wa_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

        // 1. Create device in database first
        const response = await fetch(`${apiUrl}/api/devices`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: newDevice.id,
            description: newDevice.description
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          alert(errorData.message || "Failed to create device in database");
          return;
        }

        // 2. Emit create-session to the backend to start WhatsApp
        socket.emit("create-session", {
          id: newDevice.id,
          description: newDevice.description
        });

        // 3. Update UI
        setDevices(prev => {
          if (prev.find(d => d.id === newDevice.id)) return prev;
          return [...prev, {
            id: newDevice.id,
            description: newDevice.description,
            ready: false,
            logs: ["Connecting..."],
            statusText: "Connecting..."
          }];
        });

        setNewDevice({ id: "", description: "" });
        setIsAdding(false);
      } catch (err) {
        console.error("Add device error:", err);
        alert("An error occurred while creating the device.");
      }
    }
  };

  const removeDevice = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem("wa_token");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    fetch(`${apiUrl}/api/devices/${id}/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(() => fetch(`${apiUrl}/api/devices/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      }))
      .then(() => setDevices(devices.filter(d => d.id !== id)))
      .catch(err => console.error("Could not delete:", err));
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1 className="header-title">Manage WhatsApp Devices</h1>
          <p className="header-subtitle">Multi-Device support. Scan QR codes to pair your instances.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          <span>Add Device</span>
        </button>
      </div>

      {isAdding && (
        <div className="card glass-panel" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Setup New Device</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
          <form onSubmit={handleAddDevice} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Device Name / ID *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. client-01"
                required
                value={newDevice.id}
                onChange={e => setNewDevice({ ...newDevice, id: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Description</label>
              <input
                type="text"
                className="form-input"
                placeholder="Brief description"
                value={newDevice.description}
                onChange={e => setNewDevice({ ...newDevice, description: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Start Session</button>
          </form>
        </div>
      )}

      <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', marginTop: 0 }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
            <RefreshCcw size={32} className="animate-spin text-accent" style={{ margin: '0 auto 1rem' }} />
            <p className="text-secondary">Loading devices...</p>
          </div>
        ) : (
          <>
            {devices.map((device) => (
              <div key={device.id} className="card glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-header" style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                      <Smartphone size={24} className="text-accent" />
                    </div>
                    <div>
                      <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>{device.id}</h3>
                      <div className="badge" style={{
                        background: device.ready ? 'var(--success-bg)' : device.qrUrl ? 'var(--warning-bg)' : 'var(--info-bg)',
                        color: device.ready ? 'var(--success)' : device.qrUrl ? 'var(--warning)' : 'var(--info)'
                      }}>
                        <div className={`status-dot ${device.ready ? 'active' : ''}`}></div>
                        {device.ready ? "Connected" : device.qrUrl ? "Awaiting Scan" : "Initializing"}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                  {device.description || 'No description provided.'}
                </p>

                {device.qrUrl && !device.ready && (
                  <div style={{ padding: '1rem', background: 'white', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <img src={device.qrUrl} alt={`QR Code for ${device.id}`} style={{ width: '100%', maxWidth: '200px', height: 'auto' }} />
                  </div>
                )}

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', marginBottom: '1.5rem', flex: 1, maxHeight: '100px', overflowY: 'auto' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>Status Log:</div>
                  <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{device.statusText}</div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <button className="btn btn-danger btn-sm" onClick={(e) => removeDevice(device.id, e)} title="Delete device" style={{ marginLeft: 'auto' }}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            ))}
            {devices.length === 0 && !isAdding && (
              <div className="text-muted" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>
                No devices configured yet. Click "Add Device" to start.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

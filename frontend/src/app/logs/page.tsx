"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MessageSquare, Image as ImageIcon, Video, FileText, CheckCheck, Clock, AlertCircle } from "lucide-react";

type MessageLog = {
  id: string;
  deviceId: string;
  from: string;
  to: string;
  message: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'document';
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
};

export default function LogsPage() {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Mock data
    setLogs([
      { id: "1", deviceId: "client-01", from: "System", to: "628123456789", message: "Hello, this is a test message!", type: "text", status: "read", createdAt: "2024-02-27 10:15:22" },
      { id: "2", deviceId: "client-01", from: "System", to: "628987654321", message: "Your OTP is 4452", type: "text", status: "sent", createdAt: "2024-02-27 11:05:44" },
      { id: "3", deviceId: "sales-bot", from: "System", to: "62855667788", message: "catalog.pdf", type: "document", status: "delivered", createdAt: "2024-02-27 11:20:10" },
      { id: "4", deviceId: "client-01", from: "System", to: "62811223344", message: "Failed to send due to network", type: "text", status: "failed", createdAt: "2024-02-27 11:45:00" },
    ]);
  }, []);

  const getStatusIcon = (status: MessageLog['status']) => {
    switch (status) {
      case 'read': return <CheckCheck size={16} style={{ color: '#3b82f6' }} />;
      case 'delivered': return <CheckCheck size={16} />;
      case 'sent': return <CheckCheck size={16} opacity={0.5} />;
      case 'queued': return <Clock size={16} />;
      case 'failed': return <AlertCircle size={16} style={{ color: 'var(--danger)' }} />;
    }
  };

  const getTypeIcon = (type: MessageLog['type']) => {
    switch (type) {
      case 'text': return <MessageSquare size={16} />;
      case 'image': return <ImageIcon size={16} />;
      case 'video': return <Video size={16} />;
      case 'document': return <FileText size={16} />;
      default: return <MessageSquare size={16} />;
    }
  };

  const filteredLogs = logs.filter(log =>
    log.to.includes(searchTerm) || log.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1 className="header-title">Message Logs</h1>
          <p className="header-subtitle">Track history of all messages sent through the API.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              placeholder="Search recipient or message..."
              style={{ paddingLeft: '2.5rem', width: '300px' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="card glass-panel" style={{ padding: 0 }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Device</th>
                <th>Recipient</th>
                <th>Type</th>
                <th>Message Content</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.id}>
                  <td className="text-secondary" style={{ fontSize: '0.875rem' }}>{log.createdAt}</td>
                  <td><span className="badge badge-info">{log.deviceId}</span></td>
                  <td style={{ fontWeight: 600 }}>{log.to}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                      {getTypeIcon(log.type)}
                      <span style={{ textTransform: 'capitalize' }}>{log.type}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {log.message}
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {getStatusIcon(log.status)}
                      <span className={`badge badge-${log.status === 'failed' ? 'danger' : log.status === 'read' ? 'info' : 'success'}`} style={{ textTransform: 'capitalize' }}>
                        {log.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

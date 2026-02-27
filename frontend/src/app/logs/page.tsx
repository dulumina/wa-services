"use client";

import { useState, useEffect } from "react";
import { Search, Filter, MessageSquare, Image as ImageIcon, Video, FileText, CheckCheck, Clock, AlertCircle, RefreshCcw } from "lucide-react";

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
  const [isLoading, setIsLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(`${apiUrl}/api/message/logs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setLogs(result.data.map((log: any) => ({
          ...log,
          createdAt: new Date(log.createdAt).toLocaleString()
        })));
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const getStatusIcon = (status: MessageLog['status']) => {
    switch (status) {
      case 'read': return <CheckCheck size={16} style={{ color: '#3b82f6' }} />;
      case 'delivered': return <CheckCheck size={16} />;
      case 'sent': return <CheckCheck size={16} opacity={0.5} />;
      case 'queued': return <Clock size={16} />;
      case 'failed': return <AlertCircle size={16} style={{ color: 'var(--danger)' }} />;
      default: return null;
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
          <button className="btn btn-secondary" onClick={fetchLogs}>
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
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
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center" style={{ padding: '3rem' }}>
                    <RefreshCcw size={24} className="animate-spin text-accent" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : (
                <>
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
                  {filteredLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No logs found.
                      </td>
                    </tr>
                  )}
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Globe, CheckCircle2, XCircle } from "lucide-react";

type Webhook = {
  id: string;
  url: string;
  event: string;
  isActive: boolean;
  createdAt: string;
};

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: "", event: "message" });

  useEffect(() => {
    // Mock initial data
    setWebhooks([
      { id: "1", url: "https://api.myapp.com/webhooks/wa", event: "message", isActive: true, createdAt: "2024-02-20" },
      { id: "2", url: "https://crm.company.com/wa-events", event: "status", isActive: true, createdAt: "2024-02-22" }
    ]);
  }, []);

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWebhook.url) {
      const created: Webhook = {
        id: Math.random().toString(36).substring(7),
        url: newWebhook.url,
        event: newWebhook.event,
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setWebhooks([created, ...webhooks]);
      setNewWebhook({ url: "", event: "message" });
      setIsAdding(false);
    }
  };

  const removeWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1 className="header-title">Webhooks</h1>
          <p className="header-subtitle">Configure URLs to receive real-time event notifications.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          <span>Add Webhook</span>
        </button>
      </div>

      {isAdding && (
        <div className="card glass-panel animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Register New Webhook</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
          <form onSubmit={handleAddWebhook} style={{ display: 'grid', gridTemplateColumns: '1fr 200px auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Endpoint URL *</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://your-server.com/webhook"
                required
                value={newWebhook.url}
                onChange={e => setNewWebhook({ ...newWebhook, url: e.target.value })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Event Type</label>
              <select
                className="form-input"
                value={newWebhook.event}
                onChange={e => setNewWebhook({ ...newWebhook, event: e.target.value })}
              >
                <option value="message">Message Received</option>
                <option value="status">Status Update</option>
                <option value="connection">Connection Event</option>
                <option value="all">All Events</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Add</button>
          </form>
        </div>
      )}

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr', marginTop: 0 }}>
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="card glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', background: 'var(--info-bg)', borderRadius: 'var(--radius-md)', color: 'var(--info)' }}>
                <Globe size={24} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <h3 className="card-title" style={{ marginBottom: 0 }}>{webhook.url}</h3>
                  <span className="badge badge-info">{webhook.event}</span>
                </div>
                <div className="text-secondary" style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                  Created on {webhook.createdAt}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: webhook.isActive ? 'var(--success)' : 'var(--text-muted)' }}>
                {webhook.isActive ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                <span style={{ fontWeight: 500 }}>{webhook.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-secondary btn-sm">Test</button>
                <button className="btn btn-danger btn-sm" onClick={() => removeWebhook(webhook.id)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {webhooks.length === 0 && (
          <div className="text-muted text-center" style={{ padding: '3rem' }}>
            No webhooks configured.
          </div>
        )}
      </div>
    </div>
  );
}

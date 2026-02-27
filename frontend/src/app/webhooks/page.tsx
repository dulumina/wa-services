"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Globe, CheckCircle2, XCircle, RefreshCcw, Send } from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  const fetchWebhooks = async () => {
    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(`${apiUrl}/api/webhooks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setWebhooks(result.data.map((w: any) => ({
          ...w,
          createdAt: new Date(w.createdAt).toISOString().split('T')[0]
        })));
      }
    } catch (err) {
      console.error("Failed to fetch webhooks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newWebhook.url) {
      try {
        const token = localStorage.getItem("wa_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

        const response = await fetch(`${apiUrl}/api/webhooks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newWebhook)
        });

        if (response.ok) {
          await fetchWebhooks();
          setNewWebhook({ url: "", event: "message" });
          setIsAdding(false);
        }
      } catch (err) {
        console.error("Failed to add webhook:", err);
      }
    }
  };

  const removeWebhook = async (id: string) => {
    if (!confirm("Are you sure you want to delete this webhook?")) return;

    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(`${apiUrl}/api/webhooks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setWebhooks(webhooks.filter(w => w.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete webhook:", err);
    }
  };

  const testWebhook = async (id: string) => {
    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(`${apiUrl}/api/webhooks/${id}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      alert(data.message || (response.ok ? "Test sent!" : "Failed to test"));
    } catch (err) {
      console.error("Failed to test webhook:", err);
    }
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
        {loading ? (
          <div className="text-center" style={{ padding: '3rem' }}>
            <RefreshCcw size={32} className="animate-spin text-accent" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <>
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
                    <button className="btn btn-secondary btn-sm" onClick={() => testWebhook(webhook.id)}>
                      <Send size={16} /> Test
                    </button>
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
          </>
        )}
      </div>
    </div>
  );
}

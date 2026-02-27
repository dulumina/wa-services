"use client";

import { useState, useEffect } from "react";
import { Plus, Copy, Trash2, Key, RefreshCcw } from "lucide-react";

type ApiKey = {
  id: string;
  label: string;
  key?: string;
  isActive: boolean;
  createdAt: string;
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newKey, setNewKey] = useState({ label: "" });
  const [loading, setLoading] = useState(true);

  const fetchKeys = async () => {
    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(`${apiUrl}/api/api-keys`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setKeys(result.data.map((k: any) => ({
          ...k,
          createdAt: new Date(k.createdAt).toISOString().split('T')[0]
        })));
      }
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newKey.label) {
      try {
        const token = localStorage.getItem("wa_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

        const response = await fetch(`${apiUrl}/api/api-keys`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(newKey)
        });

        if (response.ok) {
          await fetchKeys();
          setNewKey({ label: "" });
          setIsAdding(false);
        }
      } catch (err) {
        console.error("Failed to create API key:", err);
      }
    }
  };

  const removeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;

    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(`${apiUrl}/api/api-keys/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setKeys(keys.filter(k => k.id !== id));
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete API key");
      }
    } catch (err) {
      console.error("Failed to delete API key:", err);
    }
  };

  const regenerateKey = async (id: string) => {
    if (!confirm("Regenerating will invalidate the current key. Continue?")) return;

    try {
      const token = localStorage.getItem("wa_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      const response = await fetch(`${apiUrl}/api/api-keys/${id}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchKeys();
      }
    } catch (err) {
      console.error("Failed to regenerate API key:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="animate-fade-in">
      <div className="header">
        <div>
          <h1 className="header-title">API Keys</h1>
          <p className="header-subtitle">Manage tokens for accessing WhatsApp Multi-Device APIs.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
          <Plus size={20} />
          <span>Generate Key</span>
        </button>
      </div>

      {isAdding && (
        <div className="card glass-panel animate-fade-in" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <h3 className="card-title">Generate New API Key</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAdding(false)}>Cancel</button>
          </div>
          <form onSubmit={handleAddKey} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Key Label *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. My Next.js Web App"
                required
                value={newKey.label}
                onChange={e => setNewKey({ label: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>Create</button>
          </form>
        </div>
      )}

      <div className="card glass-panel">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Label</th>
                <th>API Key</th>
                <th>Created</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '3rem' }}>
                    <RefreshCcw size={24} className="animate-spin text-accent" style={{ margin: '0 auto' }} />
                  </td>
                </tr>
              ) : (
                <>
                  {keys.map((key) => (
                    <tr key={key.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <Key size={18} className="text-secondary" />
                          <strong>{key.label}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-primary)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace' }}>
                          {key.key}
                          <button
                            onClick={() => key.key && copyToClipboard(key.key)}
                            className="text-secondary hover:text-accent"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            title="Copy to clipboard"
                          >
                            <Copy size={14} />
                          </button>
                        </div>
                      </td>
                      <td className="text-secondary">{key.createdAt}</td>
                      <td>
                        <span className={`badge ${key.isActive ? 'badge-success' : 'badge-danger'}`}>
                          {key.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => regenerateKey(key.id)} title="Regenerate">
                            <RefreshCcw size={14} />
                          </button>
                          <button className="btn btn-danger btn-sm" onClick={() => removeKey(key.id)}>
                            Revoke
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {keys.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No API keys found. Generate one to get started.
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

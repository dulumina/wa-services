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

  // In a real app, we would fetch from API
  useEffect(() => {
    // Mock initial data
    setKeys([
      { id: "1", label: "Production App", key: "sk_live_...a8f9", isActive: true, createdAt: "2024-02-25" },
      { id: "2", label: "Staging Web", key: "sk_test_...j2k4", isActive: true, createdAt: "2024-02-26" }
    ]);
    setLoading(false);
  }, []);

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKey.label) {
      const createdKey: ApiKey = {
        id: Math.random().toString(36).substring(7),
        label: newKey.label,
        key: "sk_live_" + Math.random().toString(36).substring(2, 24),
        isActive: true,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setKeys([createdKey, ...keys]);
      setNewKey({ label: "" });
      setIsAdding(false);
    }
  };

  const removeKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Could add a toast here
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
                      <button className="btn btn-secondary btn-sm" title="Regenerate">
                        <RefreshCcw size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => removeKey(key.id)}>
                        Revoke
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {keys.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No API keys found. Generate one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

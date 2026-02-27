"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Success! Store token and redirect
        localStorage.setItem("wa_token", data.data.token);
        localStorage.setItem("wa_user", JSON.stringify(data.data.user));
        router.push("/");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Could not connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 40%), radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.05) 0%, transparent 40%)'
    }}>
      <div className="card glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '4rem',
            height: '4rem',
            borderRadius: 'var(--radius-lg)',
            background: 'var(--accent-gradient)',
            color: 'white',
            marginBottom: '1.5rem',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)'
          }}>
            <Activity size={32} />
          </div>
          <h1 className="header-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Create Account</h1>
          <p className="text-secondary">Join WhatsApp API Multi-User platform</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="form-input"
                placeholder="pick a username"
                style={{ paddingLeft: '2.75rem' }}
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                style={{ paddingLeft: '2.75rem' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                className="form-input"
                placeholder="min. 8 characters"
                style={{ paddingLeft: '2.75rem' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', justifyContent: 'center', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (
              <>
                <span>Get Started</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <a href="/login" style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>Sign In</a>
        </div>
      </div>
    </div>
  );
}

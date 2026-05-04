/**
 * AuthModal.jsx
 * ─────────────
 * Glassmorphism login/sign-up modal with animated tab switching.
 * Shows Supabase error messages inline. Closes on backdrop click or Escape.
 * Renders a "not configured" message when Supabase env vars are missing.
 */
import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, LogIn, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const { signIn, signUp, isConfigured } = useAuth();
  const [tab,      setTab]      = useState(defaultTab);  // 'login' | 'signup'
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(null);
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleBackdrop = (e) => { if (e.target === overlayRef.current) onClose(); };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const fn = tab === 'login' ? signIn : signUp;
    const { error: err } = await fn(email, password);

    setLoading(false);
    if (err) {
      setError(err.message);
    } else if (tab === 'signup') {
      setSuccess('Account created! Check your email to confirm, then sign in.');
    } else {
      onClose(); // login success
    }
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdrop}
      className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-20"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', animation: 'fadeIn 0.2s ease' }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl flex flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(30,27,75,0.99), rgba(15,23,42,0.99))',
          border: '1px solid rgba(139,92,246,0.3)',
          boxShadow: '0 0 60px rgba(139,92,246,0.2), 0 30px 60px rgba(0,0,0,0.6)',
          animation: 'authSlideIn 0.35s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Rainbow top bar */}
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb, #38bdf8)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-black text-slate-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {tab === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-colors" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex mx-6 mb-5 rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
          {['login', 'signup'].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(null); setSuccess(null); }}
              className="flex-1 py-2 text-xs font-bold uppercase tracking-widest transition-all duration-200"
              style={{
                background: tab === t ? 'rgba(139,92,246,0.2)' : 'transparent',
                color: tab === t ? '#a78bfa' : '#64748b',
                borderRight: t === 'login' ? '1px solid rgba(255,255,255,0.07)' : 'none',
              }}
            >
              {t === 'login' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {!isConfigured ? (
            <div className="text-center py-6 space-y-3">
              <AlertCircle className="mx-auto text-yellow-400" size={32} />
              <p className="text-sm text-slate-400 leading-relaxed">
                Supabase is not configured.<br />
                Add <code className="text-violet-400 text-xs">VITE_SUPABASE_URL</code> and{' '}
                <code className="text-violet-400 text-xs">VITE_SUPABASE_ANON_KEY</code> to your <code className="text-xs text-slate-500">.env</code> file.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-700 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                  <input
                    type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-700 outline-none transition-all"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                    onFocus={(e) => e.target.style.borderColor = 'rgba(139,92,246,0.6)'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <AlertCircle size={12} />
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-emerald-300" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                  <CheckCircle size={12} />
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }}
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : tab === 'login' ? (
                  <><LogIn size={14} /> Sign In</>
                ) : (
                  <><UserPlus size={14} /> Create Account</>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * ProtectedRoute.jsx
 * ──────────────────
 * Wraps routes that require Supabase authentication.
 * Shows a spinner while auth is resolving, then either renders
 * children or redirects to the home page with ?auth=login.
 */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: 'linear-gradient(180deg,#050810 0%,#0f172a 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-xs text-slate-600 font-semibold tracking-widest uppercase">Loading…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/?auth=login&from=${encodeURIComponent(location.pathname)}`} replace />;
  }

  return children;
}

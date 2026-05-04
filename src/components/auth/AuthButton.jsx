/**
 * AuthButton.jsx
 * ──────────────
 * Nav bar auth control:
 *  - Logged out:  "Sign In" + "Sign Up" buttons that open AuthModal on the correct tab
 *  - Logged in:   user initials avatar + "Sign Out" button
 */
import React, { useState } from 'react';
import { LogIn, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthModal from './AuthModal';

export default function AuthButton() {
  const { user, signOut, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [defaultTab, setDefaultTab] = useState('login');

  function openModal(tab) {
    setDefaultTab(tab);
    setShowModal(true);
  }

  if (loading) {
    return <div className="w-24 h-8 rounded-lg animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />;
  }

  if (user) {
    const initials = (user.email ?? 'U').slice(0, 2).toUpperCase();
    return (
      <div className="flex items-center gap-2">
        {/* Avatar */}
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black text-violet-200 flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 12px rgba(124,58,237,0.5)' }}
          title={user.email}
        >
          {initials}
        </div>
        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all"
        >
          <LogOut size={12} />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Sign Up */}
        <button
          onClick={() => openModal('signup')}
          id="auth-signup-btn"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 hover:scale-105"
          style={{
            color: '#a78bfa',
            background: 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.3)',
          }}
        >
          <UserPlus size={13} />
          Sign Up
        </button>
        {/* Sign In */}
        <button
          onClick={() => openModal('login')}
          id="auth-signin-btn"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all duration-200 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, #7c3aed, #2563eb)', boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}
        >
          <LogIn size={13} />
          Sign In
        </button>
      </div>
      {showModal && <AuthModal defaultTab={defaultTab} onClose={() => setShowModal(false)} />}
    </>
  );
}

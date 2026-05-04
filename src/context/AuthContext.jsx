/**
 * AuthContext.jsx
 * ───────────────
 * Global auth state provider. Wraps the entire app in main.jsx.
 *
 * Exposes: useAuth() → { user, session, loading, signIn, signUp, signOut, isConfigured }
 *
 * Gracefully handles unconfigured Supabase — isConfigured = false,
 * all auth methods return a descriptive error object.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) { setLoading(false); return; }

    // Hydrate from existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function signIn(email, password) {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signUp(email, password) {
    if (!isSupabaseConfigured) return { error: { message: 'Supabase not configured' } };
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  }

  async function signOut() {
    if (!isSupabaseConfigured) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      signIn, signUp, signOut,
      isConfigured: isSupabaseConfigured,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

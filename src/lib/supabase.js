/**
 * supabase.js
 * ───────────
 * Supabase client singleton. Reads credentials from Vite env vars.
 * Gracefully exports null when credentials are not configured so the
 * app still renders without crashing.
 */
import { createClient } from '@supabase/supabase-js';

const url  = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = (url && anonKey)
  ? createClient(url, anonKey)
  : null;

export const isSupabaseConfigured = !!(url && anonKey);

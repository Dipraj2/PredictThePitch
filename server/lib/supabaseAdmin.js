/**
 * supabaseAdmin.js
 * ────────────────
 * Server-side Supabase admin client using the service role key.
 * Used for JWT verification and writing simulation results to the DB.
 * Exports null when env vars are absent — the middleware will skip
 * auth checks and routes will return 503 with a clear message.
 */
import { createClient } from '@supabase/supabase-js';

const url            = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = (url && serviceRoleKey)
  ? createClient(url, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

export const isSupabaseConfigured = !!(url && serviceRoleKey);

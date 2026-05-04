/**
 * optionalAuth.js
 * ───────────────
 * Express middleware that optionally verifies a Supabase JWT.
 * Unlike requireAuth, this NEVER blocks the request.
 *  - If a valid Bearer token is present → attaches req.user and calls next()
 *  - If no token / invalid token        → sets req.user = null and calls next()
 *
 * Used for routes that work for both guests AND authenticated users,
 * e.g. the simulation sandbox (saves history for logged-in users).
 */
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabaseAdmin.js';

export async function optionalAuth(req, _res, next) {
  req.user = null; // default: unauthenticated

  if (!isSupabaseConfigured) return next();

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) return next();

  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (!error && data?.user) {
      req.user = data.user;
    }
  } catch {
    // Silently ignore — treat as unauthenticated
  }

  next();
}

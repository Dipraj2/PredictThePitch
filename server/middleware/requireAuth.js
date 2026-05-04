/**
 * requireAuth.js
 * ──────────────
 * Express middleware that verifies a Supabase JWT from the Authorization header.
 * Attaches req.user on success.
 *
 * When Supabase is not configured it returns 503 with a descriptive message.
 * When no/invalid token is provided it returns 401.
 */
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabaseAdmin.js';

export async function requireAuth(req, res, next) {
  if (!isSupabaseConfigured) {
    return res.status(503).json({
      error: 'Auth service not configured',
      detail: 'Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in server/.env',
    });
  }

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'No auth token provided' });
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data?.user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  req.user = data.user;
  next();
}

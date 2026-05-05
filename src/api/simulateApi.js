/**
 * simulateApi.js
 * ──────────────
 * Calls the Node.js middleware /api/simulate endpoint.
 * Forwards the Supabase session JWT in the Authorization header.
 */

const MIDDLEWARE_BASE = import.meta.env.VITE_MIDDLEWARE_URL ?? 'http://localhost:3001';

/**
 * @param {string} teamA
 * @param {string} teamB
 * @param {string|null} accessToken  — Supabase session.access_token
 * @param {object} extras            — optional: { league, mode, tournament_id }
 * @returns {Promise<object>}
 */
export async function runSimulation(teamA, teamB, accessToken = null, extras = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

  const body = { team_a: teamA, team_b: teamB, ...extras };

  const res = await fetch(`${MIDDLEWARE_BASE}/api/simulate`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(errBody.error ?? `HTTP ${res.status}`);
  }

  return res.json();
}

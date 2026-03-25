/**
 * predictApi.js
 * ─────────────
 * Thin wrapper around the XGBoost prediction API.
 * Base URL can be overridden via VITE_API_URL env var.
 */

const API_BASE = import.meta.env.VITE_API_URL ?? 'https://diprajmitra-predict-the-pitch-api.hf.space';

async function fetchInternal(endpoint, homeTeam, awayTeam) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_a: homeTeam, team_b: awayTeam }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }

  const data = await res.json();
  console.log(`API response for ${endpoint} (${homeTeam} vs ${awayTeam}):`, data);

  if (typeof data === 'string' && data.toLowerCase().includes('not found')) {
    throw new Error(data);
  }
  if (data?.error) {
    throw new Error(data.error);
  }

  return data;
}

/**
 * Fetches a two-leg tie prediction (Quarter-Finals, Semi-Finals).
 *
 * @param {string} teamA Full team name
 * @param {string} teamB Full team name
 * @returns {Promise<{
 *   team_a: string, team_b: string,
 *   leg1_score: string, leg2_score: string, aggregate: string,
 *   advancing_team: string, won_on_penalties: boolean
 * }>}
 */
export async function fetchTwoLegPrediction(teamA, teamB) {
  return fetchInternal('/predict_two_leg', teamA, teamB);
}

/**
 * Fetches a single-leg neutral venue prediction (Grand Final).
 *
 * @param {string} teamA Full team name
 * @param {string} teamB Full team name
 * @returns {Promise<{
 *   team_a: string, team_b: string,
 *   team_a_goals: number, team_b_goals: number,
 *   team_a_win_prob: number, draw_prob: number, team_b_win_prob: number,
 *   champion: string, won_on_penalties: boolean
 * }>}
 */
export async function fetchNeutralPrediction(teamA, teamB) {
  return fetchInternal('/predict_neutral', teamA, teamB);
}

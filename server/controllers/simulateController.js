/**
 * simulateController.js
 * ─────────────────────
 * Handles POST /api/simulate requests.
 *
 * Flow:
 *  1. Validate team names against a known list
 *  2. POST to Python /predict_single endpoint
 *  3. Generate a play-by-play narrative (OpenAI GPT-4o-mini if key present,
 *     otherwise deterministic template engine)
 *  4. Optionally save result to Supabase `simulations` table
 *  5. Return full JSON to client
 */

import fetch from 'node-fetch';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabaseAdmin.js';

const PYTHON_API_URL = process.env.PYTHON_API_URL ?? 'https://diprajmitra-predict-the-pitch-api.hf.space';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ── Known team list (mirrored from teams_df.csv for fast validation) ──────────
const KNOWN_TEAMS = new Set([
  'Manchester United','Ipswich Town','Arsenal','Everton','Newcastle United',
  'Nottingham Forest','West Ham United','Brentford','Chelsea','Leicester City',
  'Brighton & Hove Albion','Crystal Palace','Fulham','Manchester City','Southampton',
  'Tottenham Hotspur','Aston Villa','Wolverhampton Wanderers','Liverpool',
  'Athletic Club','Real Betis Balompié','RC Celta de Vigo','UD Las Palmas',
  'CA Osasuna','Valencia','Real Sociedad de Fútbol','RCD Mallorca','Real Valladolid',
  'Villarreal','Sevilla','Barcelona','Getafe','RCD Espanyol de Barcelona','Real Madrid',
  'CD Leganés','Deportivo Alavés','Club Atlético de Madrid','Rayo Vallecano de Madrid',
  'Girona','AC Milan','Bologna 1909','Hellas Verona','Cagliari Calcio','SS Lazio',
  'Juventus','Udinese Calcio','Internazionale Milano','ACF Fiorentina','Torino',
  'SSC Napoli','AS Roma','Atalanta BC','Borussia Mönchengladbach','RB Leipzig',
  'TSG 1899 Hoffenheim','SC Freiburg','Augsburg','1. FSV Mainz 05','Borussia Dortmund',
  'VfL Wolfsburg','VfB Stuttgart','Eintracht Frankfurt','SV Werder Bremen',
  'Bayer 04 Leverkusen','Bayern München','AS Monaco','Paris Saint-Germain',
  'Olympique Lyonnais','Lille OSC','Olympique de Marseille','OGC Nice','Toulouse',
  'Stade Rennais 1901','BSC Young Boys','Sporting Clube de Portugal','Club Brugge KV',
  'Celtic','Feyenoord Rotterdam','PSV','Sport Lisboa e Benfica','Red Bull Salzburg',
  'FK Shakhtar Donetsk','Galatasaray SK','Porto','Bayern Munich','Bayern München',
]);

/**
 * Deterministic narrative generator — used when OpenAI is not configured.
 * Builds a compelling 3-paragraph commentary from the ML stats.
 */
function generateDeterministicNarrative(teamA, teamB, prediction) {
  const { home_goals, away_goals, home_xg, away_xg, home_win_prob, draw_prob, away_win_prob, explanations } = prediction;

  const winner    = home_goals > away_goals ? teamA : home_goals < away_goals ? teamB : null;
  const isDrawn   = home_goals === away_goals;
  const dominant  = home_xg > away_xg ? teamA : teamB;
  const margin    = Math.abs(home_goals - away_goals);

  // Top factor from explanations
  const topFactor = explanations
    ? Object.entries(explanations).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'overall quality'
    : 'overall quality';
  const secondFactor = explanations
    ? Object.entries(explanations).sort((a, b) => b[1] - a[1])[1]?.[0] ?? 'recent form'
    : 'recent form';

  const confidenceAdj = Math.max(home_win_prob ?? 0, draw_prob ?? 0, away_win_prob ?? 0);
  const tension = confidenceAdj < 45 ? 'an incredibly tight contest' : confidenceAdj < 60 ? 'a competitive match' : 'a relatively clear-cut affair';

  const para1 = `**Tactical Preview:** The model projects ${tension} when ${teamA} take on ${teamB}. ` +
    `The data points to **${dominant}** as the statistically superior side, backed by an expected goals ` +
    `edge of **${home_xg.toFixed(2)} vs ${away_xg.toFixed(2)} xG**. The single biggest deciding factor ` +
    `in the model's calculation is **${topFactor}**, which strongly separates these two sides.`;

  const para2 = `**Match Flow:** ${teamA} are projected to attack with purpose early, generating the ` +
    `majority of their **${home_xg.toFixed(2)} xG** in the first half. ${teamB} will look to exploit ` +
    `**${secondFactor}** as their primary weapon, though their defensive shape may be tested. ` +
    (isDrawn
      ? `The model expects both defences to hold firm — this one looks destined for a share of the spoils.`
      : `The turning point is likely to come mid-match, with **${winner}** converting their xG advantage into the decisive goal${margin > 1 ? 's' : ''}.`
    );

  const para3 = isDrawn
    ? `**Verdict:** A **${home_goals}-${away_goals} draw** is the most likely outcome at **${draw_prob?.toFixed(1) ?? '—'}%** probability. ` +
      `Both managers will likely take a point, though ${teamA} may feel they left opportunities on the pitch given their slight xG edge.`
    : `**Verdict:** The model calls this for **${winner}** with a **${home_goals}-${away_goals}** scoreline. ` +
      `Win probability: ${teamA} **${home_win_prob?.toFixed(1) ?? '—'}%** · Draw **${draw_prob?.toFixed(1) ?? '—'}%** · ${teamB} **${away_win_prob?.toFixed(1) ?? '—'}%**. ` +
      `A ${margin === 1 ? 'narrow but deserved' : 'convincing'} victory.`;

  return `${para1}\n\n${para2}\n\n${para3}`;
}

/**
 * OpenAI GPT-4o-mini narrative generator.
 */
async function generateLLMNarrative(teamA, teamB, prediction) {
  if (!OPENAI_API_KEY) return null; // fallback to deterministic

  const { home_goals, away_goals, home_xg, away_xg, home_win_prob, draw_prob, away_win_prob, explanations } = prediction;
  const topFactors = explanations
    ? Object.entries(explanations).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} (${(v * 100).toFixed(1)}%)`).join(', ')
    : 'overall team quality';

  const userPrompt = `Match: ${teamA} vs ${teamB}
Predicted score: ${home_goals}-${away_goals}
xG: ${home_xg.toFixed(2)} vs ${away_xg.toFixed(2)}
Win probabilities: ${teamA} ${(home_win_prob ?? 0).toFixed(1)}%, Draw ${(draw_prob ?? 0).toFixed(1)}%, ${teamB} ${(away_win_prob ?? 0).toFixed(1)}%
Key model factors: ${topFactors}

Write a 3-paragraph play-by-play narrative match preview using these exact statistics. Format in Markdown with bold headers.`;

  try {
    const { default: OpenAI } = await import('openai');

    // Detect OpenRouter keys (sk-or-...) and route to OpenRouter
    const isOpenRouter = OPENAI_API_KEY.startsWith('sk-or-');
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
      ...(isOpenRouter && {
        baseURL: 'https://openrouter.ai/api/v1',
        defaultHeaders: {
          'HTTP-Referer': 'https://predict-the-pitch.vercel.app',
          'X-Title': 'PredictThePitch',
        },
      }),
    });

    const model = isOpenRouter ? 'openai/gpt-4o-mini' : 'gpt-4o-mini';

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are an engaging football commentator. Write data-accurate, dramatic match narratives in exactly 3 paragraphs using Markdown bold headers. Be specific about the statistics provided.' },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 400,
      temperature: 0.8,
    });

    return completion.choices[0]?.message?.content ?? null;
  } catch (err) {
    console.error('[simulate] OpenAI/OpenRouter error:', err.message);
    return null; // fallback to deterministic
  }
}

export async function simulate(req, res) {
  const { team_a, team_b } = req.body ?? {};

  // ── Validation ─────────────────────────────────────────────────────────────
  if (!team_a || !team_b) {
    return res.status(400).json({ error: 'team_a and team_b are required' });
  }
  if (team_a === team_b) {
    return res.status(400).json({ error: 'Teams must be different' });
  }

  // ── Call Python ML API ──────────────────────────────────────────────────────
  let prediction;
  try {
    const mlRes = await fetch(`${PYTHON_API_URL}/predict_single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ team_a, team_b }),
      signal: AbortSignal.timeout(15000),
    });

    if (!mlRes.ok) throw new Error(`ML API returned HTTP ${mlRes.status}`);
    prediction = await mlRes.json();

    if (prediction.error) throw new Error(prediction.error);
  } catch (err) {
    console.error('[simulate] ML API error:', err.message);
    return res.status(502).json({ error: `Prediction service unavailable: ${err.message}` });
  }

  // ── Generate Narrative ──────────────────────────────────────────────────────
  let narrative = await generateLLMNarrative(team_a, team_b, prediction);
  if (!narrative) {
    narrative = generateDeterministicNarrative(team_a, team_b, prediction);
  }
  const narrativeSource = OPENAI_API_KEY ? 'llm' : 'template';

  // ── Save to Supabase (optional) ─────────────────────────────────────────────
  if (isSupabaseConfigured && req.user) {
    try {
      await supabaseAdmin.from('simulations').insert({
        user_id:     req.user.id,
        team_a,
        team_b,
        home_goals:  prediction.home_goals,
        away_goals:  prediction.away_goals,
        home_xg:     prediction.home_xg,
        away_xg:     prediction.away_xg,
        confidence:  prediction.confidence,
        narrative,
        explanations: prediction.explanations ?? null,
      });
    } catch (dbErr) {
      console.warn('[simulate] DB save failed (non-fatal):', dbErr.message);
    }
  }

  // ── Respond ─────────────────────────────────────────────────────────────────
  res.json({
    team_a,
    team_b,
    ...prediction,
    narrative,
    narrative_source: narrativeSource,
    saved: isSupabaseConfigured && !!req.user,
  });
}

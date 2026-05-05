/**
 * simulateController.js
 * ─────────────────────
 * Handles POST /api/simulate requests.
 *
 * Flow:
 *  1. Validate team names; if league mode, validate against league roster
 *  2. POST to Python /predict_single endpoint
 *  3. Generate match events array (LLM or deterministic fallback)
 *  4. Generate narrative (LLM or deterministic fallback)
 *  5. Optionally save result to Supabase `simulations` table
 *  6. Return full JSON to client
 */

import fetch from 'node-fetch';
import { supabaseAdmin, isSupabaseConfigured } from '../lib/supabaseAdmin.js';
import { LEAGUE_TEAMS } from '../data/leagueTeams.js';

const PYTHON_API_URL = process.env.PYTHON_API_URL ?? 'https://diprajmitra-predict-the-pitch-api.hf.space';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// ── Known team list (mirrored from teams_df.csv for fast validation) ──────────
const KNOWN_TEAMS = new Set([
  'Manchester United','Ipswich Town','Arsenal','Everton','Newcastle United',
  'Nottingham Forest','West Ham United','Brentford','Chelsea','Leicester City',
  'Brighton & Hove Albion','Crystal Palace','Fulham','Manchester City','Southampton',
  'Tottenham Hotspur','Aston Villa','Wolverhampton Wanderers','Liverpool','ABournemouth',
  'Athletic Club','Real Betis Balompié','RC Celta de Vigo','UD Las Palmas',
  'CA Osasuna','Valencia','Real Sociedad de Fútbol','RCD Mallorca','Real Valladolid',
  'Villarreal','Sevilla','Barcelona','Getafe','RCD Espanyol de Barcelona','Real Madrid',
  'CD Leganés','Deportivo Alavés','Club Atlético de Madrid','Rayo Vallecano de Madrid','Girona',
  'AC Milan','Bologna 1909','Hellas Verona','Cagliari Calcio','SS Lazio',
  'Juventus','Udinese Calcio','Internazionale Milano','ACF Fiorentina','Torino',
  'SSC Napoli','AS Roma','Atalanta BC','AC Monza','Como 1907','Empoli','GenoaC',
  'Parma Calcio 1913','US Lecce','Venezia',
  'Borussia Mönchengladbach','RB Leipzig','TSG 1899 Hoffenheim','SC Freiburg',
  'Augsburg','1. FSV Mainz 05','Borussia Dortmund','VfL Wolfsburg','VfB Stuttgart',
  'Eintracht Frankfurt','SV Werder Bremen','Bayer 04 Leverkusen','Bayern München',
  '1. Heidenheim 1846','1. Union Berlin','Holstein Kiel','St. Pauli 1910','VfL Bochum 1848',
  'AS Monaco','Paris Saint-Germain','Olympique Lyonnais','Lille OSC','Olympique de Marseille',
  'OGC Nice','Toulouse','Stade Rennais 1901','AJ Auxerre','Angers SCO','AS Saint-Étienne',
  'Le Havre AC','Montpellier HSC','Nantes','Racing Club de Lens','RC Strasbourg Alsace',
  'Stade Brestois 29','Stade de Reims',
  'BSC Young Boys','Sporting Clube de Portugal','Club Brugge KV','Celtic','Feyenoord Rotterdam',
  'PSV','Sport Lisboa e Benfica','Red Bull Salzburg','FK Shakhtar Donetsk','Galatasaray SK',
  'Porto','AC Sparta Praha','FK Bodø/Glimt','FK Crvena Zvezda','GNK Dinamo Zagreb',
  'København','PAE Olympiakos SFP','Qarabağ Ağdam FK','Royal Antwerp','Royale Union Saint-Gilloise',
  'SK Slavia Praha','SK Sturm Graz','ŠK Slovan Bratislava','Sporting Clube de Braga',
]);

// ── Deterministic match events generator ──────────────────────────────────────
function generateDeterministicEvents(teamA, teamB, prediction) {
  const { home_goals = 0, away_goals = 0, home_xg = 1.2, away_xg = 1.0 } = prediction;
  const events = [];

  const homeGoalMinutes = [...Array(home_goals)].map((_, i) =>
    Math.floor(12 + (i + 1) * (76 / (home_goals + 1)))
  );
  const awayGoalMinutes = [...Array(away_goals)].map((_, i) =>
    Math.floor(18 + (i + 1) * (65 / (away_goals + 1)))
  );
  const allGoalMins = new Set([...homeGoalMinutes, ...awayGoalMinutes]);

  const attackBank = [
    `${teamA} move forward with intent, switching play wide`,
    `${teamB} win the ball back high up the pitch`,
    `A driven cross from ${teamA}'s flank — cleared at the near post`,
    `${teamB} build patiently — possession is key to their system`,
    `Quick combination play from ${teamA} opens up a chance`,
    `${teamB}'s striker peels off the shoulder — the keeper is alert`,
  ];
  const defBank = [
    `${teamA}'s defensive structure is compact and well-organised`,
    `Brilliant last-ditch challenge denies ${teamB} a clear opening`,
    `${teamA}'s goalkeeper sweeps up a dangerous through-ball`,
    `${teamB} win a free kick in a dangerous position — it comes to nothing`,
  ];
  const tacticalBank = [
    `Both managers make tactical adjustments after the drinks break`,
    `The high defensive line is being tested — a risky strategy`,
    `${teamA} are dominating possession but lacking penetration`,
    `${teamB} have had more shots on target — the stats don't lie`,
  ];

  let phase = 0;
  for (let m = 7; m <= 87; m += 6 + (phase % 3)) {
    if (allGoalMins.has(m) || [...allGoalMins].some(g => Math.abs(g - m) <= 2)) {
      const isHome = homeGoalMinutes.some(g => Math.abs(g - m) <= 2);
      events.push({
        minute: m,
        text: `GOAL! ${isHome ? teamA : teamB} find the back of the net — the crowd erupts!`,
        type: 'goal',
      });
    } else {
      const pool = phase % 3 === 0 ? attackBank : phase % 3 === 1 ? defBank : tacticalBank;
      const type  = phase % 3 === 0 ? 'attack' : phase % 3 === 1 ? 'defense' : 'tactical';
      events.push({ minute: m, text: pool[phase % pool.length], type });
    }
    phase++;
  }
  return events;
}

// ── Narrative generator (deterministic fallback) ──────────────────────────────
function generateDeterministicNarrative(teamA, teamB, prediction) {
  const { home_goals, away_goals, home_xg, away_xg, home_win_prob, draw_prob, away_win_prob, explanations } = prediction;
  const winner   = home_goals > away_goals ? teamA : home_goals < away_goals ? teamB : null;
  const isDrawn  = home_goals === away_goals;
  const dominant = home_xg > away_xg ? teamA : teamB;
  const margin   = Math.abs(home_goals - away_goals);

  const topFactor    = explanations ? Object.entries(explanations).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'overall quality' : 'overall quality';
  const secondFactor = explanations ? Object.entries(explanations).sort((a, b) => b[1] - a[1])[1]?.[0] ?? 'recent form'    : 'recent form';
  const confidenceAdj = Math.max(home_win_prob ?? 0, draw_prob ?? 0, away_win_prob ?? 0);
  const tension = confidenceAdj < 45 ? 'an incredibly tight contest' : confidenceAdj < 60 ? 'a competitive match' : 'a relatively clear-cut affair';

  const para1 = `**Tactical Preview:** The model projects ${tension} when ${teamA} take on ${teamB}. The data points to **${dominant}** as the statistically superior side, backed by an expected goals edge of **${home_xg.toFixed(2)} vs ${away_xg.toFixed(2)} xG**. The single biggest deciding factor is **${topFactor}**.`;
  const para2 = `**Match Flow:** ${teamA} are projected to attack with purpose early, generating the majority of their **${home_xg.toFixed(2)} xG** in the first half. ${teamB} will look to exploit **${secondFactor}** as their primary weapon. ` +
    (isDrawn ? `The model expects both defences to hold firm.` : `The turning point is likely to come mid-match, with **${winner}** converting their xG advantage into the decisive goal${margin > 1 ? 's' : ''}.`);
  const para3 = isDrawn
    ? `**Verdict:** A **${home_goals}-${away_goals} draw** at **${draw_prob?.toFixed(1) ?? '—'}%** probability. Both sides will feel they left opportunities on the pitch.`
    : `**Verdict:** The model calls this for **${winner}** with a **${home_goals}-${away_goals}** scoreline. Win probability: ${teamA} **${home_win_prob?.toFixed(1)}%** · Draw **${draw_prob?.toFixed(1)}%** · ${teamB} **${away_win_prob?.toFixed(1)}%**.`;

  return `${para1}\n\n${para2}\n\n${para3}`;
}

// ── LLM generator (narrative + events) ───────────────────────────────────────
async function generateLLMContent(teamA, teamB, prediction) {
  if (!OPENAI_API_KEY) return null;

  const { home_goals, away_goals, home_xg, away_xg, home_win_prob, draw_prob, away_win_prob, explanations } = prediction;
  const topFactors = explanations
    ? Object.entries(explanations).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => `${k} (${(v * 100).toFixed(1)}%)`).join(', ')
    : 'overall team quality';

  const systemPrompt = `You are an expert football commentator and analyst. Respond ONLY with valid JSON — no markdown fences, no extra text.`;

  const userPrompt = `Generate match content for: ${teamA} vs ${teamB}
Predicted score: ${teamA} ${home_goals} - ${away_goals} ${teamB}
xG: ${home_xg?.toFixed(2)} vs ${away_xg?.toFixed(2)}
Win probabilities: ${teamA} ${(home_win_prob ?? 0).toFixed(1)}%, Draw ${(draw_prob ?? 0).toFixed(1)}%, ${teamB} ${(away_win_prob ?? 0).toFixed(1)}%
Key model factors: ${topFactors}

Return this exact JSON structure:
{
  "events": [
    { "minute": <number 1-90>, "text": "<short exciting match event>", "type": "<attack|goal|defense|tactical>" }
  ],
  "narrative": "<3 paragraph markdown match preview with **bold** headers>"
}

Rules for events:
- Generate 10-14 events spread across the match
- Place GOAL events at realistic minutes based on the predicted score
- Make events specific to these two teams and the predicted stats
- Keep each event text under 90 characters`;

  try {
    const { default: OpenAI } = await import('openai');
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
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 900,
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(raw);
    return {
      events:    Array.isArray(parsed.events)    ? parsed.events    : null,
      narrative: typeof parsed.narrative === 'string' ? parsed.narrative : null,
    };
  } catch (err) {
    console.error('[simulate] LLM error:', err.message);
    return null;
  }
}

// ── Main handler ──────────────────────────────────────────────────────────────
export async function simulate(req, res) {
  const { team_a, team_b, league, mode = 'dream', tournament_id } = req.body ?? {};

  // Basic validation
  if (!team_a || !team_b) return res.status(400).json({ error: 'team_a and team_b are required' });
  if (team_a === team_b)  return res.status(400).json({ error: 'Teams must be different' });

  // League mode: validate both teams belong to the given league
  if (mode === 'league' && league) {
    const leagueSet = LEAGUE_TEAMS[league];
    if (!leagueSet) return res.status(400).json({ error: `Unknown league: ${league}` });
    if (!leagueSet.has(team_a)) return res.status(400).json({ error: `${team_a} is not in ${league}` });
    if (!leagueSet.has(team_b)) return res.status(400).json({ error: `${team_b} is not in ${league}` });
  }

  // Call Python ML API
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

  // Generate LLM content (events + narrative) or deterministic fallback
  let events    = null;
  let narrative = null;
  let narrativeSource = 'template';

  const llmContent = await generateLLMContent(team_a, team_b, prediction);
  if (llmContent) {
    events    = llmContent.events    ?? generateDeterministicEvents(team_a, team_b, prediction);
    narrative = llmContent.narrative ?? generateDeterministicNarrative(team_a, team_b, prediction);
    narrativeSource = 'llm';
  } else {
    events    = generateDeterministicEvents(team_a, team_b, prediction);
    narrative = generateDeterministicNarrative(team_a, team_b, prediction);
  }

  // Save to Supabase (optional — only when user is authenticated)
  if (isSupabaseConfigured && req.user) {
    try {
      await supabaseAdmin.from('simulations').insert({
        user_id:       req.user.id,
        team_a,
        team_b,
        home_goals:    prediction.home_goals,
        away_goals:    prediction.away_goals,
        home_xg:       prediction.home_xg,
        away_xg:       prediction.away_xg,
        confidence:    prediction.confidence,
        narrative,
        explanations:  prediction.explanations ?? null,
        mode,
        league:        league ?? null,
        tournament_id: tournament_id ?? null,
      });
    } catch (dbErr) {
      console.warn('[simulate] DB save failed (non-fatal):', dbErr.message);
    }
  }

  res.json({
    team_a,
    team_b,
    ...prediction,
    events,
    narrative,
    narrative_source: narrativeSource,
    saved: isSupabaseConfigured && !!req.user,
  });
}

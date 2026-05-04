/**
 * fixturesController.js
 * ─────────────────────
 * Fetches upcoming UEFA Champions League fixtures from football-data.org,
 * normalises team names to match the XGBoost model vocabulary, then returns
 * enriched fixture metadata ready for the frontend bracket.
 *
 * Falls back gracefully to static UCL fixtures when the API key is missing or
 * the external service is unreachable.
 */

import fetch from 'node-fetch';

const PYTHON_API_URL = process.env.PYTHON_API_URL ?? 'https://diprajmitra-predict-the-pitch-api.hf.space';
const FD_API_KEY = process.env.FOOTBALL_DATA_API_KEY;

// UCL competition code on football-data.org
const UCL_COMPETITION_CODE = 'CL';

/**
 * Maps football-data.org team names → model vocabulary names.
 * Add entries here whenever a new team appears in the fixture feed.
 */
const TEAM_NAME_MAP = {
  'FC Barcelona':              'Barcelona',
  'Real Madrid CF':            'Real Madrid',
  'FC Bayern München':         'Bayern Munich',
  'Paris Saint-Germain FC':    'Paris Saint-Germain',
  'Arsenal FC':                'Arsenal',
  'Liverpool FC':              'Liverpool',
  'Club Atlético de Madrid':   'Club Atlético de Madrid',
  'Sporting CP':               'Sporting Clube de Portugal',
  'Borussia Dortmund':         'Borussia Dortmund',
  'FC Internazionale Milano':  'Inter Milan',
  'Chelsea FC':                'Chelsea',
  'Manchester City FC':        'Manchester City',
  'Juventus FC':               'Juventus',
  'AC Milan':                  'AC Milan',
  'SL Benfica':                'Benfica',
  'FC Porto':                  'Porto',
  'Ajax Amsterdam':            'Ajax',
  'RB Leipzig':                'RB Leipzig',
  'Villarreal CF':             'Villarreal',
};

function normaliseTeamName(rawName) {
  return TEAM_NAME_MAP[rawName] ?? rawName;
}

/** Derive a stable match_id from round label + team names */
function makeMatchId(roundName, teamA, teamB) {
  const r = roundName?.replace(/\s+/g, '_').toUpperCase() ?? 'UNK';
  const a = teamA.slice(0, 3).toUpperCase();
  const b = teamB.slice(0, 3).toUpperCase();
  return `${r}_${a}_${b}`;
}

/** Determine stage label from football-data.org round descriptor */
function deriveStage(roundName = '') {
  const r = roundName.toLowerCase();
  if (r.includes('final') && r.includes('quarter')) return 'Quarter-Final';
  if (r.includes('semi')) return 'Semi-Final';
  if (r.includes('final')) return 'Final';
  if (r.includes('last 16') || r.includes('round of 16')) return 'Round of 16';
  return roundName;
}

/**
 * Static fallback fixtures — identical to the current useBracketPredictions.js
 * hard-coded list. Used when API is unavailable.
 */
const STATIC_FIXTURES = [
  { match_id: 'QF1', stage: 'Quarter-Final', team_a: 'Paris Saint-Germain', team_b: 'Liverpool' },
  { match_id: 'QF2', stage: 'Quarter-Final', team_a: 'Real Madrid',          team_b: 'Bayern Munich' },
  { match_id: 'QF3', stage: 'Quarter-Final', team_a: 'Barcelona',            team_b: 'Club Atlético de Madrid' },
  { match_id: 'QF4', stage: 'Quarter-Final', team_a: 'Sporting Clube de Portugal', team_b: 'Arsenal' },
  { match_id: 'SF1', stage: 'Semi-Final',    team_a: 'Paris Saint-Germain', team_b: 'Real Madrid' },
  { match_id: 'SF2', stage: 'Semi-Final',    team_a: 'Barcelona',            team_b: 'Arsenal' },
  { match_id: 'F1',  stage: 'Final',         team_a: 'Paris Saint-Germain', team_b: 'Barcelona' },
];

/**
 * Fetch upcoming UCL fixtures from football-data.org.
 * Returns normalised fixture objects or the static fallback array.
 */
async function fetchLiveFixtures() {
  if (!FD_API_KEY) {
    console.warn('[fixtures] No FOOTBALL_DATA_API_KEY set — using static fixtures.');
    return { fixtures: STATIC_FIXTURES, source: 'static' };
  }

  const url = `https://api.football-data.org/v4/competitions/${UCL_COMPETITION_CODE}/matches?status=SCHEDULED`;

  let response;
  try {
    response = await fetch(url, {
      headers: { 'X-Auth-Token': FD_API_KEY },
      signal: AbortSignal.timeout(6000),
    });
  } catch (err) {
    console.error('[fixtures] Network error:', err.message);
    return { fixtures: STATIC_FIXTURES, source: 'static', error: err.message };
  }

  if (!response.ok) {
    console.error('[fixtures] football-data.org returned', response.status);
    return { fixtures: STATIC_FIXTURES, source: 'static', error: `HTTP ${response.status}` };
  }

  const json = await response.json();
  const matches = json.matches ?? [];

  if (matches.length === 0) {
    return { fixtures: STATIC_FIXTURES, source: 'static' };
  }

  // Group by round — take knockout matches only
  const knockoutStages = new Set(['QUARTER_FINALS', 'SEMI_FINALS', 'FINAL', 'LAST_16']);
  const filtered = matches.filter(m => knockoutStages.has(m.stage));

  if (filtered.length === 0) {
    return { fixtures: STATIC_FIXTURES, source: 'static' };
  }

  const fixtures = filtered.map((m, i) => {
    const teamA = normaliseTeamName(m.homeTeam?.name ?? 'Unknown');
    const teamB = normaliseTeamName(m.awayTeam?.name ?? 'Unknown');
    const stage = deriveStage(m.stage ?? '');
    return {
      match_id: makeMatchId(m.stage, teamA, teamB),
      stage,
      team_a: teamA,
      team_b: teamB,
      utcDate: m.utcDate,
      matchday: m.matchday,
    };
  });

  return { fixtures, source: 'live' };
}

/**
 * Express route handler: GET /api/fixtures/upcoming
 */
export async function getUpcomingFixtures(req, res) {
  try {
    const { fixtures, source, error } = await fetchLiveFixtures();
    res.json({
      source,           // 'live' | 'static'
      count: fixtures.length,
      fixtures,
      ...(error ? { warning: error } : {}),
    });
  } catch (err) {
    console.error('[fixtures] Unhandled error:', err);
    res.status(500).json({ error: err.message, fixtures: STATIC_FIXTURES, source: 'static' });
  }
}

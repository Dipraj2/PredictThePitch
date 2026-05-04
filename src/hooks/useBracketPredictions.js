/**
 * useBracketPredictions.js
 * ─────────────────────────
 * Fires one API call per UCL bracket fixture in parallel and stitches
 * the live predictions back into the bracket structure.
 *
 * Data source priority:
 *  1. Live fixtures from Node.js middleware (football-data.org)
 *  2. Static FIXTURES array (fallback when middleware is unavailable)
 */

import { useEffect, useState } from 'react';
import { fetchTwoLegPrediction, fetchNeutralPrediction, fetchUpcomingFixtures } from '../api/predictApi';

/**
 * Static fixture metadata — fallback when live API is unavailable.
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
 * Picks the 4 QF, 2 SF, and 1 Final fixtures from a live fixtures array.
 * Falls back to static if the live array doesn't contain enough fixtures.
 */
function resolveFixtures(liveFixtures) {
  const qfs = liveFixtures.filter(f => f.stage === 'Quarter-Final').slice(0, 4);
  const sfs = liveFixtures.filter(f => f.stage === 'Semi-Final').slice(0, 2);
  const finals = liveFixtures.filter(f => f.stage === 'Final').slice(0, 1);

  // If we don't have all 4 QFs from live, use static
  if (qfs.length < 4) return { fixtures: STATIC_FIXTURES, source: 'static' };

  // Re-tag match IDs for bracket consumption
  const tagged = [
    ...qfs.map((f, i) => ({ ...f, match_id: `QF${i + 1}` })),
    ...sfs.map((f, i) => ({ ...f, match_id: `SF${i + 1}` })),
    ...finals.map(f => ({ ...f, match_id: 'F1' })),
  ];

  return { fixtures: tagged, source: 'live' };
}

export function useBracketPredictions() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState('static'); // 'live' | 'static'
  const [tick, setTick] = useState(0); // bumped by retry()

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function loadBracket() {
      try {
        // 0. Try to get live fixtures from the middleware
        const { fixtures: liveFixtures, source: liveSource } = await fetchUpcomingFixtures();
        const { fixtures: baseFixtures, source: resolvedSource } =
          liveFixtures.length > 0
            ? resolveFixtures(liveFixtures)
            : { fixtures: STATIC_FIXTURES, source: 'static' };

        if (!cancelled) setDataSource(resolvedSource);

        const qfFixtures = baseFixtures.filter(f => f.stage === 'Quarter-Final');

        // 1. Fetch Quarter Finals
        const qfRequests = qfFixtures.map(f =>
          fetchTwoLegPrediction(f.team_a, f.team_b)
            .then(data => ({ ok: true, fixture: f, data }))
            .catch(err => ({ ok: false, fixture: f, error: err.message }))
        );
        const qfResults = await Promise.all(qfRequests);
        if (cancelled) return;

        // Map advancing teams, default to team_a if API fails
        const getAdvancing = (idx) => {
          const res = qfResults[idx];
          return (res.ok && res.data && res.data.advancing_team)
            ? res.data.advancing_team
            : qfFixtures[idx]?.team_a;
        };

        const sf1TeamA = getAdvancing(0);
        const sf1TeamB = getAdvancing(1);
        const sf2TeamA = getAdvancing(2);
        const sf2TeamB = getAdvancing(3);

        // 2. Fetch Semi Finals dynamically
        const sfFixtures = [
          { match_id: 'SF1', stage: 'Semi-Final', team_a: sf1TeamA, team_b: sf1TeamB },
          { match_id: 'SF2', stage: 'Semi-Final', team_a: sf2TeamA, team_b: sf2TeamB },
        ];

        const sfRequests = sfFixtures.map(f =>
          fetchTwoLegPrediction(f.team_a, f.team_b)
            .then(data => ({ ok: true, fixture: f, data }))
            .catch(err => ({ ok: false, fixture: f, error: err.message }))
        );
        const sfResults = await Promise.all(sfRequests);
        if (cancelled) return;

        const getAdvancingSF = (idx) => {
          const res = sfResults[idx];
          return (res.ok && res.data && res.data.advancing_team)
            ? res.data.advancing_team
            : sfFixtures[idx].team_a;
        };

        const finalTeamA = getAdvancingSF(0);
        const finalTeamB = getAdvancingSF(1);

        // 3. Fetch Final dynamically
        const finalFixture = { match_id: 'F1', stage: 'Final', team_a: finalTeamA, team_b: finalTeamB };
        let finalResult;
        try {
          const data = await fetchNeutralPrediction(finalFixture.team_a, finalFixture.team_b);
          finalResult = { ok: true, fixture: finalFixture, data };
        } catch (err) {
          finalResult = { ok: false, fixture: finalFixture, error: err.message };
        }
        if (cancelled) return;

        // 4. Construct final matches array
        const allResults = [...qfResults, ...sfResults, finalResult];

        const anyFailed = allResults.some(r => !r.ok);
        if (anyFailed && allResults.every(r => !r.ok)) {
          setError(allResults[0].error ?? 'Unable to reach the prediction API.');
          setMatches([]);
        } else {
          const enriched = allResults.map(({ ok, fixture, data, error: perErr }) => {
            if (!ok) return { ...fixture, fetchError: perErr };
            return { ...fixture, ...data };
          });
          setMatches(enriched);
          if (anyFailed) setError('Some predictions could not be loaded.');
        }

      } catch (e) {
        if (!cancelled) {
          setError(e.message);
          setMatches([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadBracket();

    return () => { cancelled = true; };
  }, [tick]);

  return { matches, isLoading, error, dataSource, retry: () => setTick((t) => t + 1) };
}

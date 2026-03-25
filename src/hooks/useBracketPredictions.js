/**
 * useBracketPredictions.js
 * ─────────────────────────
 * Fires one API call per UCL bracket fixture in parallel and stitches
 * the live predictions back into the bracket structure.
 */

import { useEffect, useState } from 'react';
import { fetchTwoLegPrediction, fetchNeutralPrediction } from '../api/predictApi';

/**
 * Static fixture metadata — mirrors the bracket layout.
 */
const FIXTURES = [
  { match_id: 'QF1', stage: 'Quarter-Final', team_a: 'Paris Saint-Germain', team_b: 'Liverpool' },
  { match_id: 'QF2', stage: 'Quarter-Final', team_a: 'Real Madrid',          team_b: 'Bayern Munich' },
  { match_id: 'QF3', stage: 'Quarter-Final', team_a: 'Barcelona',            team_b: 'Club Atlético de Madrid' },
  { match_id: 'QF4', stage: 'Quarter-Final', team_a: 'Sporting Clube de Portugal', team_b: 'Arsenal' },
  { match_id: 'SF1', stage: 'Semi-Final',    team_a: 'Paris Saint-Germain', team_b: 'Real Madrid' },
  { match_id: 'SF2', stage: 'Semi-Final',    team_a: 'Barcelona',            team_b: 'Arsenal' },
  { match_id: 'F1',  stage: 'Final',         team_a: 'Paris Saint-Germain', team_b: 'Barcelona' },
];

export function useBracketPredictions() {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0); // bumped by retry()

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    async function loadBracket() {
      try {
        // 1. Fetch Quarter Finals
        const qfRequests = FIXTURES.slice(0, 4).map(f => 
          fetchTwoLegPrediction(f.team_a, f.team_b)
            .then(data => ({ ok: true, fixture: f, data }))
            .catch(err => ({ ok: false, fixture: f, error: err.message }))
        );
        const qfResults = await Promise.all(qfRequests);
        if (cancelled) return;

        // Map advancing teams, default to originally planned if API fails
        const getAdvancing = (idx) => {
          const res = qfResults[idx];
          return (res.ok && res.data && res.data.advancing_team) 
            ? res.data.advancing_team 
            : FIXTURES[idx].team_a; // Fallback
        };

        const sf1TeamA = getAdvancing(0); // QF1 Winner
        const sf1TeamB = getAdvancing(1); // QF2 Winner
        const sf2TeamA = getAdvancing(2); // QF3 Winner
        const sf2TeamB = getAdvancing(3); // QF4 Winner

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
            : sfFixtures[idx].team_a; // Fallback
        };

        const finalTeamA = getAdvancingSF(0); // SF1 Winner
        const finalTeamB = getAdvancingSF(1); // SF2 Winner

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

        // Construct final matches array
        const allResults = [...qfResults, ...sfResults, finalResult];
        
        const anyFailed = allResults.some(r => !r.ok);
        if (anyFailed && allResults.every(r => !r.ok)) {
          setError(allResults[0].error ?? 'Unable to reach the prediction API.');
          setMatches([]);
        } else {
          const enriched = allResults.map(({ ok, fixture, data, error: perErr }) => {
            if (!ok) {
              return { ...fixture, fetchError: perErr };
            }
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

  return { matches, isLoading, error, retry: () => setTick((t) => t + 1) };
}

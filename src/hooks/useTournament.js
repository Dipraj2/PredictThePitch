/**
 * useTournament.js
 * ────────────────
 * Manages full tournament state for both knockout-8 and mini-league-4 formats.
 *
 * Returns:
 *   { format, name, teams, fixtures, standings, champion,
 *     setFormat, setName, setTeams, simulateFixture, reset, isLoading }
 */
import { useState, useCallback } from 'react';
import { runSimulation } from '../api/simulateApi';
import { useAuth } from '../context/AuthContext';

/** Build QF→SF→Final fixture skeleton for 8-team knockout */
function buildKnockoutFixtures(teams) {
  const qfFixtures = [];
  for (let i = 0; i < 4; i++) {
    qfFixtures.push({
      id: `qf-${i}`,
      round: 'QF',
      homeTeam: teams[i * 2] ?? null,
      awayTeam: teams[i * 2 + 1] ?? null,
      result: null,
    });
  }
  const sfFixtures = [
    { id: 'sf-0', round: 'SF', homeTeam: null, awayTeam: null, result: null },
    { id: 'sf-1', round: 'SF', homeTeam: null, awayTeam: null, result: null },
  ];
  const final = [{ id: 'final', round: 'Final', homeTeam: null, awayTeam: null, result: null }];
  return [...qfFixtures, ...sfFixtures, ...final];
}

/** Build round-robin fixture list for 4-team mini-league */
function buildLeagueFixtures(teams) {
  const fixtures = [];
  let id = 0;
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      fixtures.push({
        id: `match-${id++}`,
        round: `Match ${id}`,
        homeTeam: teams[i],
        awayTeam: teams[j],
        result: null,
      });
    }
  }
  return fixtures;
}

/** Init standings for mini-league */
function initStandings(teams) {
  return teams.map(t => ({
    team: t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, pts: 0,
  }));
}

export function useTournament() {
  const { session } = useAuth();
  const [format,    setFormat]    = useState('knockout-8');   // 'knockout-8' | 'mini-league-4'
  const [name,      setName]      = useState('My Dream Tournament');
  const [teams,     setTeams]     = useState([]);             // string[]
  const [fixtures,  setFixtures]  = useState([]);
  const [standings, setStandings] = useState([]);
  const [champion,  setChampion]  = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);

  /** Call after teams are finalised to build the initial fixture list */
  const buildTournament = useCallback((selectedTeams, selectedFormat) => {
    const f = selectedFormat ?? format;
    const t = selectedTeams ?? teams;
    const fixtureList = f === 'knockout-8'
      ? buildKnockoutFixtures(t)
      : buildLeagueFixtures(t);
    setFixtures(fixtureList);
    if (f === 'mini-league-4') setStandings(initStandings(t));
    setChampion(null);
  }, [format, teams]);

  /** Advance knockout bracket after QF results */
  function advanceKnockout(updatedFixtures) {
    const qf = updatedFixtures.filter(f => f.round === 'QF' && f.result);
    if (qf.length < 4) return updatedFixtures; // not all QF done

    const sfWinners = qf.map(f =>
      f.result.home_goals > f.result.away_goals ? f.homeTeam : f.awayTeam
    );

    const newFixtures = updatedFixtures.map(f => {
      if (f.id === 'sf-0') return { ...f, homeTeam: sfWinners[0], awayTeam: sfWinners[1] };
      if (f.id === 'sf-1') return { ...f, homeTeam: sfWinners[2], awayTeam: sfWinners[3] };
      return f;
    });

    const sf = newFixtures.filter(f => f.round === 'SF' && f.result);
    if (sf.length < 2) return newFixtures;

    const finalWinners = sf.map(f =>
      f.result.home_goals > f.result.away_goals ? f.homeTeam : f.awayTeam
    );
    return newFixtures.map(f => {
      if (f.id === 'final') return { ...f, homeTeam: finalWinners[0], awayTeam: finalWinners[1] };
      return f;
    });
  }

  /** Update mini-league standings after a result */
  function updateStandings(prevStandings, homeTeam, awayTeam, hg, ag) {
    return prevStandings.map(row => {
      if (row.team === homeTeam) {
        const win = hg > ag, draw = hg === ag;
        return {
          ...row, played: row.played + 1,
          wins: row.wins + (win ? 1 : 0), draws: row.draws + (draw ? 1 : 0),
          losses: row.losses + (!win && !draw ? 1 : 0),
          gf: row.gf + hg, ga: row.ga + ag, pts: row.pts + (win ? 3 : draw ? 1 : 0),
        };
      }
      if (row.team === awayTeam) {
        const win = ag > hg, draw = ag === hg;
        return {
          ...row, played: row.played + 1,
          wins: row.wins + (win ? 1 : 0), draws: row.draws + (draw ? 1 : 0),
          losses: row.losses + (!win && !draw ? 1 : 0),
          gf: row.gf + ag, ga: row.ga + hg, pts: row.pts + (win ? 3 : draw ? 1 : 0),
        };
      }
      return row;
    });
  }

  const simulateFixture = useCallback(async (fixtureId) => {
    const fixture = fixtures.find(f => f.id === fixtureId);
    if (!fixture || !fixture.homeTeam || !fixture.awayTeam) return;

    setIsLoading(true);
    setLoadingId(fixtureId);
    try {
      const result = await runSimulation(
        fixture.homeTeam,
        fixture.awayTeam,
        session?.access_token ?? null,
        { mode: 'tournament' }
      );

      setFixtures(prev => {
        let updated = prev.map(f => f.id === fixtureId ? { ...f, result } : f);
        if (format === 'knockout-8') updated = advanceKnockout(updated);

        // Check for champion
        const finalFixture = updated.find(f => f.id === 'final' && f.result);
        if (finalFixture) {
          setChampion(
            finalFixture.result.home_goals > finalFixture.result.away_goals
              ? finalFixture.homeTeam
              : finalFixture.awayTeam
          );
        }

        // Mini-league: check if all matches done → crown leader
        if (format === 'mini-league-4') {
          const allDone = updated.every(f => f.result);
          if (allDone) {
            setStandings(prev2 => {
              const finalStandings = [...prev2].sort((a, b) => (b.pts - a.pts) || ((b.gf - b.ga) - (a.gf - a.ga)));
              setChampion(finalStandings[0]?.team ?? null);
              return finalStandings;
            });
          }
        }
        return updated;
      });

      if (format === 'mini-league-4') {
        setStandings(prev =>
          updateStandings(prev, fixture.homeTeam, fixture.awayTeam, result.home_goals, result.away_goals)
        );
      }
    } catch (err) {
      console.error('[tournament] simulation error:', err.message);
    } finally {
      setIsLoading(false);
      setLoadingId(null);
    }
  }, [fixtures, format, session]);

  function reset() {
    setFixtures([]); setStandings([]); setChampion(null); setTeams([]);
  }

  return {
    format, setFormat,
    name, setName,
    teams, setTeams,
    fixtures, standings, champion,
    buildTournament, simulateFixture,
    isLoading, loadingId,
    reset,
  };
}

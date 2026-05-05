/**
 * LeagueSimulatePage.jsx
 * ──────────────────────
 * Mode A: League-gated simulation.
 * Step 1 → pick competition  Step 2 → pick teams  Step 3 → animate & reveal
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, RotateCcw, Zap, Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LEAGUES, LEAGUE_TEAMS } from '../data/leagueTeams';
import LeagueTeamSelector from '../components/simulation/LeagueTeamSelector';
import MatchDayEngine from '../components/simulation/MatchDayEngine';
import SimulationResult from '../components/simulation/SimulationResult';
import MiniLeagueTable from '../components/tournament/MiniLeagueTable';
import { runSimulation } from '../api/simulateApi';
import { useAuth } from '../context/AuthContext';

function initStandings(teams) {
  return teams.map(t => ({ team: t, played: 0, wins: 0, draws: 0, losses: 0, gf: 0, ga: 0, pts: 0 }));
}

function updateStandings(prev, home, away, hg, ag) {
  return prev.map(row => {
    if (row.team === home) {
      const w = hg > ag, d = hg === ag;
      return { ...row, played: row.played+1, wins: row.wins+(w?1:0), draws: row.draws+(d?1:0), losses: row.losses+(!w&&!d?1:0), gf: row.gf+hg, ga: row.ga+ag, pts: row.pts+(w?3:d?1:0) };
    }
    if (row.team === away) {
      const w = ag > hg, d = ag === hg;
      return { ...row, played: row.played+1, wins: row.wins+(w?1:0), draws: row.draws+(d?1:0), losses: row.losses+(!w&&!d?1:0), gf: row.gf+ag, ga: row.ga+hg, pts: row.pts+(w?3:d?1:0) };
    }
    return row;
  });
}

export default function LeagueSimulatePage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [selectedLeague, setSelectedLeague] = useState(null);
  const [teamA,     setTeamA]     = useState('');
  const [teamB,     setTeamB]     = useState('');
  const [simPhase,  setSimPhase]  = useState('idle'); // idle | loading | animating | complete
  const [result,    setResult]    = useState(null);
  const [error,     setError]     = useState(null);
  const [standings, setStandings] = useState([]);

  const teams = selectedLeague ? LEAGUE_TEAMS[selectedLeague.code] : [];
  const canSimulate = teamA && teamB && teamA !== teamB && simPhase === 'idle';

  function handleLeagueSelect(league) {
    setSelectedLeague(league);
    setTeamA(''); setTeamB('');
    setResult(null); setError(null); setSimPhase('idle');
    setStandings(initStandings(LEAGUE_TEAMS[league.code]));
  }

  function handleSwap() { setTeamA(teamB); setTeamB(teamA); setResult(null); setSimPhase('idle'); }

  async function handleSimulate() {
    if (!canSimulate) return;
    setSimPhase('loading');
    setError(null);
    setResult(null);
    try {
      const data = await runSimulation(teamA, teamB, session?.access_token ?? null, {
        mode: 'league', league: selectedLeague.code,
      });
      setResult(data);
      setSimPhase('animating');
    } catch (e) {
      setError(e.message);
      setSimPhase('idle');
    }
  }

  function handleAnimationComplete(res) {
    setStandings(prev => updateStandings(prev, teamA, teamB, res.home_goals, res.away_goals));
    setSimPhase('complete');
  }

  function handleReset() {
    setTeamA(''); setTeamB('');
    setResult(null); setError(null); setSimPhase('idle');
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#050810 0%,#0f172a 40%,#0c1526 100%)' }}>
      {/* Header */}
      <div className="border-b border-white/[0.05] px-4 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/dashboard')}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all">
            <ArrowLeft size={16} />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.25),rgba(239,68,68,0.15))', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Trophy size={15} className="text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-100" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
              League Simulation
            </h1>
            <p className="text-xs text-slate-600">Teams are strictly filtered to the selected competition</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Step 1: League Picker */}
        <AnimatePresence mode="wait">
          {!selectedLeague ? (
            <motion.div key="picker" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-600 mb-5">
                Select Competition
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {LEAGUES.map((l, i) => (
                  <motion.button key={l.code}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleLeagueSelect(l)}
                    className="flex flex-col items-center gap-3 p-5 rounded-2xl text-center transition-all group"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-3xl">{l.flag}</span>
                    <div>
                      <p className="text-sm font-black text-slate-200">{l.name}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">
                        {LEAGUE_TEAMS[l.code].length} teams
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div key="simulate" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {/* League badge + change */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <span className="text-lg">{selectedLeague.flag}</span>
                  <span className="text-xs font-black text-amber-400">{selectedLeague.name}</span>
                </div>
                <button onClick={() => { setSelectedLeague(null); handleReset(); }}
                  className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors underline">
                  Change league
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Left: controls */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-2xl p-5 space-y-5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Configure Match</p>

                    <LeagueTeamSelector label="Home Team" teams={teams} value={teamA}
                      onChange={t => { setTeamA(t); setResult(null); setSimPhase('idle'); }} exclude={teamB} />

                    <div className="flex justify-center">
                      <button onClick={handleSwap}
                        className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-slate-500 hover:text-slate-300 transition-all hover:scale-105"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <ArrowLeftRight size={12} />Swap
                      </button>
                    </div>

                    <LeagueTeamSelector label="Away Team" teams={teams} value={teamB}
                      onChange={t => { setTeamB(t); setResult(null); setSimPhase('idle'); }} exclude={teamA} />

                    <button id="league-simulate-btn" type="button" onClick={handleSimulate}
                      disabled={!canSimulate}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                      style={{
                        background: canSimulate ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'rgba(255,255,255,0.06)',
                        boxShadow: canSimulate ? '0 4px 24px rgba(124,58,237,0.4)' : 'none',
                        fontFamily: "'Rajdhani',sans-serif",
                      }}>
                      {simPhase === 'loading' ? (
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : <Zap size={16} />}
                      {simPhase === 'loading' ? 'Simulating…' : 'Simulate Match'}
                    </button>

                    {(simPhase === 'complete' || error) && (
                      <button onClick={handleReset}
                        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-400 transition-colors">
                        <RotateCcw size={11} />Reset
                      </button>
                    )}
                  </div>

                  {/* Session points table */}
                  {standings.some(s => s.played > 0) && (
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2">Session Table</p>
                      <MiniLeagueTable standings={standings.filter(s => s.played > 0)} />
                    </div>
                  )}
                </div>

                {/* Right: result */}
                <div className="lg:col-span-3">
                  <AnimatePresence mode="wait">
                    {error ? (
                      <motion.div key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="rounded-2xl p-6 text-center"
                          style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <p className="text-sm text-red-400 font-semibold mb-1">Simulation Failed</p>
                          <p className="text-xs text-slate-500">{error}</p>
                        </div>
                      </motion.div>
                    ) : (simPhase === 'animating' || simPhase === 'loading') && result ? (
                      <motion.div key="engine" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <MatchDayEngine teamA={teamA} teamB={teamB} result={result} onComplete={handleAnimationComplete} />
                      </motion.div>
                    ) : simPhase === 'complete' && result ? (
                      <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                        <SimulationResult result={result} />
                      </motion.div>
                    ) : (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="rounded-2xl p-12 flex flex-col items-center justify-center text-center min-h-[340px]"
                          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
                          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                            style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
                            <Trophy size={28} className="text-amber-500" />
                          </div>
                          <p className="text-slate-500 font-semibold mb-1">Ready to Simulate</p>
                          <p className="text-xs text-slate-700 max-w-xs">
                            Select two teams from the <span className="text-amber-600 font-bold">{selectedLeague.name}</span> and click Simulate Match.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

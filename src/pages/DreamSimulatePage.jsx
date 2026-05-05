/**
 * DreamSimulatePage.jsx
 * ─────────────────────
 * Mode B: Unrestricted sandbox — any 194 teams, plus link to tournament builder.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftRight, RotateCcw, Zap, Globe, Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamSelector from '../components/simulation/TeamSelector';
import MatchDayEngine from '../components/simulation/MatchDayEngine';
import SimulationResult from '../components/simulation/SimulationResult';
import { runSimulation } from '../api/simulateApi';
import { useAuth } from '../context/AuthContext';

export default function DreamSimulatePage() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [teamA,    setTeamA]    = useState('');
  const [teamB,    setTeamB]    = useState('');
  const [simPhase, setSimPhase] = useState('idle');
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);

  const canSimulate = teamA && teamB && teamA !== teamB && simPhase === 'idle';

  function handleSwap() { setTeamA(teamB); setTeamB(teamA); setResult(null); setSimPhase('idle'); }

  async function handleSimulate() {
    if (!canSimulate) return;
    setSimPhase('loading');
    setError(null);
    setResult(null);
    try {
      const data = await runSimulation(teamA, teamB, session?.access_token ?? null, { mode: 'dream' });
      setResult(data);
      setSimPhase('animating');
    } catch (e) {
      setError(e.message);
      setSimPhase('idle');
    }
  }

  function handleAnimationComplete() { setSimPhase('complete'); }

  function handleReset() { setTeamA(''); setTeamB(''); setResult(null); setError(null); setSimPhase('idle'); }

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
            style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.25),rgba(37,99,235,0.15))', border: '1px solid rgba(139,92,246,0.3)' }}>
            <Globe size={15} className="text-violet-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-100" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
              Dream Simulation
            </h1>
            <p className="text-xs text-slate-600">Any team vs any team — across any league</p>
          </div>

          {/* Tournament CTA */}
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/tournament')}
            className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(239,68,68,0.1))',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#fbbf24',
            }}>
            <Trophy size={13} />
            Create Dream Tournament
          </motion.button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Mobile tournament CTA */}
        <motion.button
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate('/tournament')}
          className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold mb-6 transition-all"
          style={{
            background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(239,68,68,0.08))',
            border: '1px solid rgba(245,158,11,0.25)',
            color: '#fbbf24',
          }}>
          <Trophy size={15} />
          🏆 Create Dream Tournament
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: controls */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl p-5 space-y-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Configure Match</p>

              <TeamSelector label="Home Team" value={teamA}
                onChange={t => { setTeamA(t); setResult(null); setSimPhase('idle'); }} exclude={teamB} />

              <div className="flex justify-center">
                <button onClick={handleSwap}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-slate-500 hover:text-slate-300 transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <ArrowLeftRight size={12} />Swap
                </button>
              </div>

              <TeamSelector label="Away Team" value={teamB}
                onChange={t => { setTeamB(t); setResult(null); setSimPhase('idle'); }} exclude={teamA} />

              <button id="dream-simulate-btn" type="button" onClick={handleSimulate}
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

            {/* Info card */}
            <div className="rounded-xl px-4 py-3 space-y-2"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">How it works</p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                <li>📊 <strong className="text-slate-500">XGBoost</strong> predicts xG and win probabilities</li>
                <li>⚽ <strong className="text-slate-500">Match Day Engine</strong> animates the game live</li>
                <li>📝 <strong className="text-slate-500">LLM events</strong> generate play-by-play commentary</li>
                <li>🏆 <strong className="text-slate-500">Tournament Builder</strong> — run full 8-team brackets</li>
              </ul>
            </div>
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
                      style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
                      <Zap size={28} className="text-violet-600" />
                    </div>
                    <p className="text-slate-500 font-semibold mb-1">Dream Matchup Awaits</p>
                    <p className="text-xs text-slate-700 max-w-xs">
                      Pick any two clubs from the full 194-team database and let the XGBoost engine decide the outcome.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

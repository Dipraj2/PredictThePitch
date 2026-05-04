/**
 * SimulatePage.jsx
 * ────────────────
 * Full-page simulation sandbox. Accessible at /simulate.
 *
 * Layout:
 *  - Left panel: TeamSelector (A + B) + Simulate button
 *  - Right panel: SimulationResult / SimulationSkeleton / empty state
 *
 * When Supabase is configured AND user is not logged in, shows a
 * "Sign in to simulate" prompt — but still allows demo use without auth.
 */
import React, { useState } from 'react';
import { Zap, Info, RotateCcw, ArrowLeftRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TeamSelector from '../components/simulation/TeamSelector';
import SimulationResult from '../components/simulation/SimulationResult';
import SimulationSkeleton from '../components/simulation/SimulationSkeleton';
import AuthModal from '../components/auth/AuthModal';
import { useSimulation } from '../hooks/useSimulation';
import { useAuth } from '../context/AuthContext';

export default function SimulatePage() {
  const { user, isConfigured } = useAuth();
  const { simulate, result, isLoading, error, reset } = useSimulation();
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const canSimulate = !isLoading && teamA && teamB && teamA !== teamB;

  function handleSwap() {
    setTeamA(teamB);
    setTeamB(teamA);
    reset();
  }

  function handleSimulate() {
    simulate(teamA, teamB);
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #050810 0%, #0f172a 40%, #0c1526 100%)' }}>
      {/* Page header */}
      <div className="border-b border-white/[0.05] px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(37,99,235,0.3))', border: '1px solid rgba(139,92,246,0.3)' }}>
              <Zap size={16} className="text-violet-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Match Simulation Sandbox
            </h1>
          </div>
          <p className="text-sm text-slate-500 max-w-xl">
            Pick any two teams from 194 clubs across 10 European leagues. The XGBoost engine will predict
            the outcome using real statistical weights — and generate a custom match narrative.
          </p>

          {/* Auth nudge */}
          {isConfigured && !user && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-yellow-300"
              style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.2)' }}>
              <Info size={12} />
              <span>
                <button onClick={() => setShowAuthModal(true)} className="underline hover:text-yellow-200 transition-colors">Sign in</button>
                {' '}to save your simulation history to the cloud.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left panel: controls ──────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl p-5 space-y-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}>

              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest">Configure Match</p>

              <TeamSelector label="Home Team" value={teamA} onChange={(t) => { setTeamA(t); reset(); }} exclude={teamB} />

              {/* Swap button */}
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleSwap}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs text-slate-500 hover:text-slate-300 transition-all hover:scale-105"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  title="Swap teams"
                >
                  <ArrowLeftRight size={12} />
                  Swap
                </button>
              </div>

              <TeamSelector label="Away Team" value={teamB} onChange={(t) => { setTeamB(t); reset(); }} exclude={teamA} />

              {/* Simulate button */}
              <button
                id="simulate-btn"
                type="button"
                onClick={handleSimulate}
                disabled={!canSimulate}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02]"
                style={{
                  background: canSimulate ? 'linear-gradient(135deg, #7c3aed, #2563eb)' : 'rgba(255,255,255,0.06)',
                  boxShadow: canSimulate ? '0 4px 24px rgba(124,58,237,0.4)' : 'none',
                  fontFamily: "'Rajdhani', sans-serif",
                  letterSpacing: '0.05em',
                }}
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Zap size={16} />
                )}
                {isLoading ? 'Simulating…' : 'Simulate Match'}
              </button>

              {/* Reset */}
              {(result || error) && (
                <button
                  type="button"
                  onClick={() => { reset(); setTeamA(''); setTeamB(''); }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs text-slate-600 hover:text-slate-400 transition-colors"
                >
                  <RotateCcw size={11} />
                  Reset
                </button>
              )}
            </div>

            {/* Info card */}
            <div className="rounded-xl px-4 py-3 space-y-2"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">How it works</p>
              <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
                <li>📊 <strong className="text-slate-500">XGBoost</strong> predicts xG and win probabilities</li>
                <li>⚙️ <strong className="text-slate-500">Feature weights</strong> explain the key decision factors</li>
                <li>📝 <strong className="text-slate-500">Narrative engine</strong> writes the match preview</li>
                {isConfigured && <li>💾 <strong className="text-slate-500">Supabase</strong> saves your history</li>}
              </ul>
            </div>
          </div>

          {/* ── Right panel: result ───────────────────────────────────────── */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <SimulationSkeleton />
                </motion.div>
              ) : error ? (
                <motion.div key="error" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="rounded-2xl p-6 text-center"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <p className="text-sm text-red-400 font-semibold mb-1">Simulation Failed</p>
                    <p className="text-xs text-slate-500">{error}</p>
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
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
                    <p className="text-slate-500 font-semibold mb-1">Ready to Simulate</p>
                    <p className="text-xs text-slate-700 max-w-xs">Select two teams on the left and click <strong className="text-slate-600">Simulate Match</strong> to run the XGBoost prediction engine.</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

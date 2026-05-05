/**
 * TournamentPage.jsx
 * ──────────────────
 * Custom Competition Creator — 4-step wizard:
 *  Step 1: Choose format (8-team knockout | 4-team mini-league) + name
 *  Step 2: Draft teams (slot picker)
 *  Step 3: Bracket / schedule + simulate
 *  Step 4: Champion reveal with confetti
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ArrowLeft, Users, Play, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Confetti from 'react-confetti';
import TeamSelector from '../components/simulation/TeamSelector';
import BracketTree from '../components/tournament/BracketTree';
import MiniLeagueTable from '../components/tournament/MiniLeagueTable';
import { useTournament } from '../hooks/useTournament';
import { getTeamLogo } from '../utils/teamUtils';

const FORMATS = [
  {
    id: 'knockout-8',
    title: '8-Team Knockout',
    icon: '🏆',
    desc: 'Quarter-Finals → Semi-Finals → Grand Final',
    teamCount: 8,
  },
  {
    id: 'mini-league-4',
    title: '4-Team Mini-League',
    icon: '📋',
    desc: 'Round-robin — every team plays every other team',
    teamCount: 4,
  },
];

function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-2">
      {[...Array(total)].map((_, i) => (
        <div key={i} className={`h-1 rounded-full transition-all duration-500 ${
          i < current ? 'bg-violet-500' : i === current ? 'bg-violet-400 w-6' : 'bg-white/10'
        }`} style={{ width: i === current ? 24 : 12 }} />
      ))}
      <span className="text-[10px] text-slate-600 font-bold ml-1">{current + 1}/{total}</span>
    </div>
  );
}

export default function TournamentPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0: format, 1: draft, 2: play, 3: champion
  const [localFormat, setLocalFormat] = useState('knockout-8');
  const [tournamentName, setTournamentName] = useState('My Dream Tournament');
  const [draftTeams, setDraftTeams] = useState([]);

  const {
    format, setFormat,
    name, setName,
    fixtures, standings, champion,
    buildTournament, simulateFixture,
    isLoading, loadingId,
  } = useTournament();

  const teamCount = localFormat === 'knockout-8' ? 8 : 4;

  function handleDraftTeam(idx, teamName) {
    const next = [...draftTeams];
    next[idx] = teamName;
    setDraftTeams(next);
  }

  function handleStartTournament() {
    setFormat(localFormat);
    setName(tournamentName);
    buildTournament(draftTeams, localFormat);
    setStep(2);
  }

  // Watch for champion
  React.useEffect(() => {
    if (champion) setStep(3);
  }, [champion]);

  const allSlotsFilled = draftTeams.filter(Boolean).length === teamCount;

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#050810 0%,#0f172a 40%,#0c1526 100%)' }}>
      {/* Champion confetti */}
      {step === 3 && (
        <Confetti numberOfPieces={300} recycle={false} gravity={0.25}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 999, pointerEvents: 'none' }} />
      )}

      {/* Header */}
      <div className="border-b border-white/[0.05] px-4 py-5">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <button onClick={() => navigate('/simulate/dream')}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all">
            <ArrowLeft size={16} />
          </button>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Trophy size={15} className="text-amber-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-black text-slate-100" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
              Tournament Builder
            </h1>
            <p className="text-xs text-slate-600">
              {step < 2 ? 'Build your custom competition' : name}
            </p>
          </div>
          <StepIndicator current={Math.min(step, 3)} total={4} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">

          {/* ── STEP 0: Format picker ───────────────────────────────────── */}
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <h2 className="text-lg font-black text-slate-200 mb-6" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                Choose Your Format
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {FORMATS.map(f => (
                  <button key={f.id} onClick={() => setLocalFormat(f.id)}
                    className="text-left p-5 rounded-2xl transition-all"
                    style={{
                      background: localFormat === f.id ? 'rgba(139,92,246,0.12)' : 'rgba(255,255,255,0.03)',
                      border: localFormat === f.id ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: localFormat === f.id ? '0 0 20px rgba(139,92,246,0.15)' : 'none',
                    }}>
                    <div className="text-2xl mb-3">{f.icon}</div>
                    <p className="font-black text-slate-200 mb-1" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                      {f.title}
                    </p>
                    <p className="text-xs text-slate-500">{f.desc}</p>
                    <p className="text-[10px] text-slate-700 mt-2">{f.teamCount} teams</p>
                  </button>
                ))}
              </div>

              <div className="mb-6">
                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-600 block mb-2">
                  Tournament Name
                </label>
                <input
                  type="text"
                  value={tournamentName}
                  onChange={e => setTournamentName(e.target.value)}
                  maxLength={50}
                  className="w-full md:w-80 px-4 py-3 rounded-xl text-sm text-slate-200 outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                  placeholder="My Dream Tournament"
                />
              </div>

              <button onClick={() => { setDraftTeams(Array(teamCount).fill('')); setStep(1); }}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 24px rgba(124,58,237,0.4)', fontFamily: "'Rajdhani',sans-serif" }}>
                <Users size={16} />Draft Teams
              </button>
            </motion.div>
          )}

          {/* ── STEP 1: Team draft ──────────────────────────────────────── */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-200" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                  Draft Your {teamCount} Teams
                </h2>
                <button onClick={() => setStep(0)} className="text-[10px] text-slate-600 hover:text-slate-400 underline">
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {[...Array(teamCount)].map((_, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl p-4"
                    style={{
                      background: draftTeams[i] ? 'rgba(139,92,246,0.06)' : 'rgba(255,255,255,0.02)',
                      border: draftTeams[i] ? '1px solid rgba(139,92,246,0.2)' : '1px solid rgba(255,255,255,0.06)',
                    }}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-700 mb-2">
                      Slot {i + 1}
                      {draftTeams[i] && <span className="ml-2 text-violet-500">✓ Drafted</span>}
                    </p>
                    <TeamSelector
                      label=""
                      value={draftTeams[i] || ''}
                      onChange={t => handleDraftTeam(i, t)}
                      exclude={null}
                    />
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={handleStartTournament}
                  disabled={!allSlotsFilled}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: allSlotsFilled ? 'linear-gradient(135deg,#7c3aed,#2563eb)' : 'rgba(255,255,255,0.06)',
                    boxShadow: allSlotsFilled ? '0 4px 24px rgba(124,58,237,0.4)' : 'none',
                    fontFamily: "'Rajdhani',sans-serif",
                  }}>
                  <Play size={16} />
                  Start Tournament
                </button>
                <p className="text-xs text-slate-700">
                  {draftTeams.filter(Boolean).length}/{teamCount} teams drafted
                </p>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Play ────────────────────────────────────────────── */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black text-slate-200" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                  {name}
                </h2>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa' }}>
                  {format === 'knockout-8' ? '🏆 Knockout' : '📋 Mini-League'}
                </div>
              </div>

              {format === 'knockout-8' ? (
                <BracketTree fixtures={fixtures} onSimulate={simulateFixture} isLoading={isLoading} />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                  <div className="lg:col-span-3 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Fixtures</p>
                    {fixtures.map(f => (
                      <motion.div key={f.id} layout
                        className="flex items-center gap-3 px-4 py-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span className="text-xs text-slate-500 flex-1 text-right font-semibold">{f.homeTeam}</span>
                        {f.result ? (
                          <span className="text-sm font-black text-white tabular-nums px-2"
                            style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                            {f.result.home_goals} – {f.result.away_goals}
                          </span>
                        ) : (
                          <button onClick={() => simulateFixture(f.id)}
                            disabled={isLoading && loadingId === f.id}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-white transition-all disabled:opacity-50"
                            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
                            {isLoading && loadingId === f.id ? (
                              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                            ) : <><Play size={9} />Simulate</>}
                          </button>
                        )}
                        <span className="text-xs text-slate-500 flex-1 font-semibold">{f.awayTeam}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="lg:col-span-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-3">Standings</p>
                    <MiniLeagueTable standings={standings} />
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 3: Champion ─────────────────────────────────────────── */}
          {step === 3 && (
            <motion.div key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <motion.div
                initial={{ scale: 0, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg,rgba(245,158,11,0.3),rgba(239,68,68,0.2))', border: '2px solid rgba(245,158,11,0.5)', boxShadow: '0 0 60px rgba(245,158,11,0.3)' }}>
                <Star size={44} className="text-amber-400" />
              </motion.div>

              {(() => {
                const logo = champion ? getTeamLogo(champion) : null;
                return logo ? (
                  <motion.img src={logo} alt={champion}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="w-24 h-24 object-contain mb-4 drop-shadow-2xl"
                    onError={e => { e.currentTarget.style.display = 'none'; }} />
                ) : null;
              })()}

              <motion.p
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-[12px] font-bold uppercase tracking-[0.25em] text-amber-500 mb-2">
                🏆 Tournament Champion
              </motion.p>
              <motion.h2
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-5xl font-black text-white mb-3"
                style={{ fontFamily: "'Rajdhani',sans-serif", background: 'linear-gradient(90deg,#fbbf24,#f87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {champion}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="text-sm text-slate-500 mb-8">{name}</motion.p>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                onClick={() => navigate('/simulate/dream')}
                className="px-6 py-3 rounded-xl font-black text-sm text-white transition-all hover:scale-[1.03]"
                style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', boxShadow: '0 4px 24px rgba(124,58,237,0.4)', fontFamily: "'Rajdhani',sans-serif" }}>
                Build Another Tournament
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

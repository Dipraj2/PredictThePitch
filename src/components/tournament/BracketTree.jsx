/**
 * BracketTree.jsx
 * ───────────────
 * Renders an 8-team single-elimination bracket (QF → SF → Final).
 * Each fixture slot shows a "Simulate" button or the result if done.
 *
 * Props:
 *   fixtures    array   — [{ id, homeTeam, awayTeam, result, round }]
 *   onSimulate  fn(id)  — called when user clicks Simulate for a fixture
 *   isLoading   bool
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ChevronRight } from 'lucide-react';
import { getTeamLogo } from '../../utils/teamUtils';

function TeamSlot({ name, isWinner }) {
  const logo = name ? getTeamLogo(name) : null;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
      isWinner
        ? 'bg-emerald-500/10 border border-emerald-500/30'
        : 'bg-white/[0.03] border border-white/[0.07]'
    }`}>
      {logo ? (
        <img src={logo} alt={name} className="w-4 h-4 object-contain flex-shrink-0"
          onError={e => { e.currentTarget.style.display = 'none'; }} />
      ) : (
        <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
      )}
      <span className={`text-xs font-semibold truncate ${
        isWinner ? 'text-emerald-400' : name ? 'text-slate-300' : 'text-slate-700'
      }`}>
        {name || 'TBD'}
      </span>
      {isWinner && <span className="text-[9px] text-emerald-500 font-black uppercase ml-auto">✓</span>}
    </div>
  );
}

function FixtureCard({ fixture, onSimulate, isLoading }) {
  const { id, homeTeam, awayTeam, result, round } = fixture;
  const canSimulate = homeTeam && awayTeam && !result;
  const homeWin = result && result.home_goals > result.away_goals;
  const awayWin = result && result.away_goals > result.home_goals;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl overflow-hidden w-44"
      style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="px-2 py-1.5 border-b border-white/[0.05]">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-700">{round}</p>
      </div>
      <div className="p-2 space-y-1.5">
        <TeamSlot name={homeTeam} isWinner={homeWin} />
        <div className="flex items-center justify-center gap-1">
          {result ? (
            <span className="text-sm font-black text-white tabular-nums"
              style={{ fontFamily: "'Rajdhani',sans-serif" }}>
              {result.home_goals} – {result.away_goals}
            </span>
          ) : (
            <span className="text-[10px] text-slate-700">vs</span>
          )}
        </div>
        <TeamSlot name={awayTeam} isWinner={awayWin} />

        {canSimulate && (
          <button
            onClick={() => onSimulate(id)}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[10px] font-bold text-white mt-1 transition-all hover:scale-[1.03] disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)' }}>
            {isLoading ? (
              <span className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><Zap size={9} />Simulate</>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

function RoundColumn({ title, fixtures, onSimulate, isLoading }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-600">{title}</p>
      <div className="flex flex-col gap-4 justify-center h-full">
        {fixtures.map(f => (
          <FixtureCard key={f.id} fixture={f} onSimulate={onSimulate} isLoading={isLoading} />
        ))}
      </div>
    </div>
  );
}

export default function BracketTree({ fixtures, onSimulate, isLoading }) {
  const qf = fixtures.filter(f => f.round === 'QF');
  const sf = fixtures.filter(f => f.round === 'SF');
  const fi = fixtures.filter(f => f.round === 'Final');

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex items-center gap-3 min-w-max mx-auto w-fit">
        <RoundColumn title="Quarter-Finals" fixtures={qf} onSimulate={onSimulate} isLoading={isLoading} />
        <div className="flex flex-col gap-6">
          {qf.map((_, i) => i % 2 === 0 && (
            <ChevronRight key={i} size={16} className="text-slate-700" />
          ))}
        </div>
        <RoundColumn title="Semi-Finals" fixtures={sf} onSimulate={onSimulate} isLoading={isLoading} />
        <ChevronRight size={16} className="text-slate-700" />
        <RoundColumn title="Final" fixtures={fi} onSimulate={onSimulate} isLoading={isLoading} />
      </div>
    </div>
  );
}

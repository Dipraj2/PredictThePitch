/**
 * MiniLeagueTable.jsx
 * ────────────────────
 * Animated league standings table for 4-team mini-league tournaments.
 * Rows sort by points → goal difference on each update.
 *
 * Props:
 *   standings   array   — [{ team, played, wins, draws, losses, gf, ga, pts }]
 */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamLogo } from '../../utils/teamUtils';

export default function MiniLeagueTable({ standings = [] }) {
  const sorted = [...standings].sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });

  if (sorted.length === 0) return null;

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Header */}
      <div className="px-4 py-2.5 border-b border-white/[0.05]">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Standings</p>
      </div>

      <div className="px-2">
        {/* Column labels */}
        <div className="flex items-center gap-1 px-2 py-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-700">
          <span className="w-4 text-center">#</span>
          <span className="flex-1 ml-2">Team</span>
          <span className="w-6 text-center">P</span>
          <span className="w-6 text-center">W</span>
          <span className="w-6 text-center">D</span>
          <span className="w-6 text-center">L</span>
          <span className="w-8 text-center">GD</span>
          <span className="w-8 text-center font-black text-slate-500">Pts</span>
        </div>

        {/* Rows */}
        <AnimatePresence>
          {sorted.map((row, i) => {
            const logo = getTeamLogo(row.team);
            const gd = (row.gf ?? 0) - (row.ga ?? 0);
            const isTop = i === 0 && row.pts > 0;
            return (
              <motion.div
                key={row.team}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05 }}
                className={`flex items-center gap-1 px-2 py-2 rounded-lg mb-1 ${
                  isTop ? 'bg-emerald-500/[0.06] border border-emerald-500/20' : ''
                }`}>
                <span className={`w-4 text-center text-[10px] font-black ${
                  isTop ? 'text-emerald-500' : 'text-slate-700'
                }`}>{i + 1}</span>
                <div className="flex-1 flex items-center gap-2 ml-2">
                  {logo ? (
                    <img src={logo} alt={row.team} className="w-4 h-4 object-contain flex-shrink-0"
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-white/10 flex-shrink-0" />
                  )}
                  <span className="text-xs font-semibold text-slate-300 truncate max-w-[90px]">
                    {row.team}
                  </span>
                </div>
                <span className="w-6 text-center text-[11px] text-slate-500">{row.played}</span>
                <span className="w-6 text-center text-[11px] text-slate-500">{row.wins}</span>
                <span className="w-6 text-center text-[11px] text-slate-500">{row.draws}</span>
                <span className="w-6 text-center text-[11px] text-slate-500">{row.losses}</span>
                <span className={`w-8 text-center text-[11px] font-semibold ${
                  gd > 0 ? 'text-emerald-500' : gd < 0 ? 'text-red-500' : 'text-slate-600'
                }`}>{gd > 0 ? '+' : ''}{gd}</span>
                <span className={`w-8 text-center text-[11px] font-black ${
                  isTop ? 'text-emerald-400' : 'text-slate-300'
                }`}>{row.pts}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

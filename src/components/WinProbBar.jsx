import React, { useEffect, useState } from 'react';

/**
 * WinProbBar — 3-segment animated probability bar
 *
 * Props:
 *   homeTeam   string  — home team name
 *   awayTeam   string  — away team name
 *   homePct    number  — home win %
 *   drawPct    number  — draw %
 *   awayPct    number  — away win %
 */
export default function WinProbBar({ homeTeam, awayTeam, homePct, drawPct, awayPct }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  const h = animated ? homePct : 0;
  const d = animated ? drawPct : 0;
  const a = animated ? awayPct : 0;

  const fmt = (v) => (v ?? 0).toFixed(1);

  return (
    <div className="space-y-3">
      {/* Team labels */}
      <div className="flex justify-between items-center text-sm font-bold">
        <span className="text-slate-200 truncate max-w-[40%]">{homeTeam}</span>
        <span className="text-slate-500 text-xs uppercase tracking-wider">Draw</span>
        <span className="text-slate-200 truncate max-w-[40%] text-right">{awayTeam}</span>
      </div>

      {/* 3-segment bar */}
      <div
        className="relative h-10 rounded-xl overflow-hidden flex"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {/* Home */}
        <div
          className="h-full flex items-center justify-start pl-3 transition-all duration-1000 ease-out"
          style={{
            width: `${h}%`,
            background: 'linear-gradient(90deg, #6d28d9, #7c3aed)',
            minWidth: animated && homePct > 0 ? '44px' : '0',
          }}
        >
          <span className="text-white font-black text-sm" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {fmt(homePct)}%
          </span>
        </div>

        {/* Draw */}
        <div
          className="h-full flex items-center justify-center transition-all duration-1000 ease-out overflow-hidden"
          style={{
            width: `${d}%`,
            background: 'linear-gradient(90deg, #334155, #475569)',
            minWidth: animated && drawPct > 0 ? '44px' : '0',
          }}
        >
          <span className="text-slate-300 font-black text-sm" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {fmt(drawPct)}%
          </span>
        </div>

        {/* Away */}
        <div
          className="h-full flex items-center justify-end pr-3 flex-1 transition-all duration-1000 ease-out"
          style={{ background: 'linear-gradient(90deg, #0369a1, #0284c7)' }}
        >
          <span className="text-white font-black text-sm" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {fmt(awayPct)}%
          </span>
        </div>

        {/* Dividers */}
        {animated && homePct > 0 && drawPct > 0 && (
          <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${h}%` }} />
        )}
        {animated && drawPct > 0 && awayPct > 0 && (
          <div className="absolute top-0 bottom-0 w-px bg-white/20" style={{ left: `${h + d}%` }} />
        )}
      </div>

      {/* Stat pills */}
      <div className="flex justify-between gap-2">
        <StatPill label="Home win" value={fmt(homePct)} color="text-violet-300" />
        <StatPill label="Draw" value={fmt(drawPct)} color="text-slate-400" />
        <StatPill label="Away win" value={fmt(awayPct)} color="text-sky-300" />
      </div>
    </div>
  );
}

function StatPill({ label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-0.5 flex-1">
      <span className={`text-base font-black ${color}`} style={{ fontFamily: "'Rajdhani',sans-serif" }}>
        {value}%
      </span>
      <span className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</span>
    </div>
  );
}

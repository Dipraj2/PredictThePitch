import React, { useEffect, useState } from 'react';

/**
 * WinProbBar
 * Animated dual-fill win probability bar.
 * team1Pct: 0-100, team2Pct: 0-100
 */
export default function WinProbBar({ team1, team2, team1Pct, team2Pct }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-3">
      {/* Labels */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-lg">{team1.flag}</span>
          <span className="text-sm font-bold text-slate-200">{team1.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-200">{team2.name}</span>
          <span className="text-lg">{team2.flag}</span>
        </div>
      </div>

      {/* Bar */}
      <div className="relative h-10 rounded-xl overflow-hidden flex"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {/* Team 1 fill */}
        <div
          className="h-full flex items-center justify-start pl-3 transition-all duration-1000 ease-out"
          style={{
            width: animated ? `${team1Pct}%` : '0%',
            background: 'linear-gradient(90deg, #6d28d9, #7c3aed)',
            minWidth: animated && team1Pct > 0 ? '40px' : '0',
          }}
        >
          <span className="text-white font-black text-sm" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {team1Pct}%
          </span>
        </div>
        {/* Team 2 fill */}
        <div
          className="h-full flex items-center justify-end pr-3 flex-1 transition-all duration-1000 ease-out"
          style={{
            background: 'linear-gradient(90deg, #0369a1, #0284c7)',
          }}
        >
          <span className="text-white font-black text-sm" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {team2Pct}%
          </span>
        </div>

        {/* Center divider */}
        <div className="absolute top-0 bottom-0 w-px bg-white/20"
          style={{ left: `${team1Pct}%` }} />
      </div>

      {/* Legend */}
      <div className="flex justify-between text-[11px] text-slate-500">
        <span>Win probability</span>
        <span>Win probability</span>
      </div>
    </div>
  );
}

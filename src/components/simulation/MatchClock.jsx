/**
 * MatchClock.jsx
 * ──────────────
 * Visual football match clock: counts from 0:00 → 90:00 over a given duration.
 * Also renders the live scoreboard with team logos.
 *
 * Props:
 *   teamA       string   — home team name
 *   teamB       string   — away team name
 *   durationMs  number   — total clock duration in ms (default 7000)
 *   homeGoals   number   — current home score (updates trigger flash)
 *   awayGoals   number   — current away score
 *   isComplete  bool     — freeze at 90' when true
 */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTeamLogo } from '../../utils/teamUtils';

const MATCH_DURATION_MS = 7000; // tunable

export default function MatchClock({
  teamA, teamB,
  durationMs = MATCH_DURATION_MS,
  homeGoals = 0,
  awayGoals = 0,
  isComplete = false,
}) {
  const [elapsed, setElapsed] = useState(0); // 0–1 progress
  const [flashHome, setFlashHome] = useState(false);
  const [flashAway, setFlashAway] = useState(false);
  const prevHome = useRef(0);
  const prevAway = useRef(0);
  const startTime = useRef(Date.now());
  const rafId    = useRef(null);

  // Animate clock forward
  useEffect(() => {
    if (isComplete) { setElapsed(1); return; }
    startTime.current = Date.now();
    function tick() {
      const t = Math.min((Date.now() - startTime.current) / durationMs, 1);
      setElapsed(t);
      if (t < 1) rafId.current = requestAnimationFrame(tick);
    }
    rafId.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId.current);
  }, [durationMs, isComplete]);

  // Flash on goal
  useEffect(() => {
    if (homeGoals > prevHome.current) {
      setFlashHome(true);
      setTimeout(() => setFlashHome(false), 900);
    }
    prevHome.current = homeGoals;
  }, [homeGoals]);

  useEffect(() => {
    if (awayGoals > prevAway.current) {
      setFlashAway(true);
      setTimeout(() => setFlashAway(false), 900);
    }
    prevAway.current = awayGoals;
  }, [awayGoals]);

  const minute = Math.round(elapsed * 90);
  const logoA  = getTeamLogo(teamA);
  const logoB  = getTeamLogo(teamB);

  return (
    <div className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>

      {/* Progress bar */}
      <div className="h-1 w-full bg-white/5">
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg,#7c3aed,#10b981)' }}
          initial={{ width: 0 }}
          animate={{ width: `${elapsed * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Body */}
      <div className="px-6 py-5">
        {/* Clock */}
        <div className="flex items-center justify-center mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className={`w-1.5 h-1.5 rounded-full ${isComplete ? 'bg-slate-600' : 'bg-emerald-400 animate-pulse'}`} />
            <span className="text-sm font-black tabular-nums text-slate-200"
              style={{ fontFamily: "'Rajdhani',sans-serif" }}>
              {isComplete ? "90'" : `${minute}'`}
            </span>
            {isComplete && <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">FT</span>}
          </div>
        </div>

        {/* Scoreboard */}
        <div className="flex items-center justify-between gap-4">
          {/* Team A */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {logoA ? (
              <img src={logoA} alt={teamA} className="w-12 h-12 object-contain drop-shadow"
                onError={e => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black text-slate-500"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {teamA.slice(0, 2).toUpperCase()}
              </div>
            )}
            <p className="text-[11px] font-bold text-slate-400 text-center leading-tight line-clamp-2">{teamA}</p>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="flex items-center gap-1">
              <AnimatePresence mode="wait">
                <motion.span key={`h-${homeGoals}`}
                  initial={{ scale: flashHome ? 1.6 : 1, color: flashHome ? '#10b981' : '#fff' }}
                  animate={{ scale: 1, color: '#fff' }}
                  className="text-4xl font-black tabular-nums text-white"
                  style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                  {homeGoals}
                </motion.span>
              </AnimatePresence>
              <span className="text-3xl font-black text-slate-600 mx-1"
                style={{ fontFamily: "'Rajdhani',sans-serif" }}>–</span>
              <AnimatePresence mode="wait">
                <motion.span key={`a-${awayGoals}`}
                  initial={{ scale: flashAway ? 1.6 : 1, color: flashAway ? '#10b981' : '#fff' }}
                  animate={{ scale: 1, color: '#fff' }}
                  className="text-4xl font-black tabular-nums text-white"
                  style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                  {awayGoals}
                </motion.span>
              </AnimatePresence>
            </div>
            <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">
              {isComplete ? 'Full Time' : 'Live'}
            </p>
          </div>

          {/* Team B */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {logoB ? (
              <img src={logoB} alt={teamB} className="w-12 h-12 object-contain drop-shadow"
                onError={e => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black text-slate-500"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {teamB.slice(0, 2).toUpperCase()}
              </div>
            )}
            <p className="text-[11px] font-bold text-slate-400 text-center leading-tight line-clamp-2">{teamB}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

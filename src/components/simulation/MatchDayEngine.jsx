/**
 * MatchDayEngine.jsx
 * ──────────────────
 * The centrepiece animated simulation experience.
 *
 * Stages:
 *  0 – Kickoff (0.5s)    : teams appear, clock starts
 *  1 – Play-by-play (~5s): sequential event ticker, clock ticks 0→90
 *  2 – Final whistle      : clock freezes at 90', "Full Time" banner
 *  3 – Reveal (1s)        : transition to SimulationResult via onComplete
 *
 * Props:
 *   teamA       string
 *   teamB       string
 *   result      object   — full API result (from useSimulation)
 *   onComplete  fn       — called when animation finishes (passes result)
 */
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Zap } from 'lucide-react';
import MatchClock from './MatchClock';

const MATCH_DURATION_MS = 7000;
const EVENT_ICONS = { attack: '⚡', goal: '⚽', defense: '🛡️', tactical: '🧠', default: '📋' };

// Generates deterministic events when LLM events are absent
function buildFallbackEvents(teamA, teamB, result) {
  const { home_goals = 0, away_goals = 0, home_xg = 1.2, away_xg = 1.0 } = result;
  const events = [];
  const goalMinutes = [
    ...[...Array(home_goals)].map((_, i) => Math.floor(10 + (i + 1) * (80 / (home_goals + 1)))),
    ...[...Array(away_goals)].map((_, i) => Math.floor(15 + (i + 1) * (75 / (away_goals + 1)))),
  ].sort((a, b) => a - b);

  const attackPhrases = [
    `${teamA} build patiently from the back, probing for a gap`,
    `${teamB} counter at pace — the defence scrambles to recover`,
    `A deep cross from ${teamA}'s right flank clips the bar`,
    `${teamB} win a corner. The set-piece comes to nothing`,
    `${teamA} win possession high up the pitch`,
    `${teamB}'s pressing has been relentless since the restart`,
  ];
  const defPhrases = [
    `${teamA}'s backline holds firm under pressure`,
    `Clearance off the line! ${teamB} denied by a brilliant recovery`,
    `The keeper palms away a dangerous low drive`,
    `${teamA}'s midfield cuts off the supply line`,
  ];
  const tacticalPhrases = [
    `The manager signals a shape change — 4-2-3-1 gives way to 4-4-2`,
    `High defensive line being exploited. Adjustments needed`,
    `Possession stats flatter — xG tells a different story`,
  ];

  let phase = 0;
  for (let m = 8; m <= 88; m += Math.floor(7 + Math.random() * 8)) {
    const isGoal = goalMinutes.includes(m) || goalMinutes.some(g => Math.abs(g - m) <= 2);
    if (isGoal) {
      const scorer = m % 2 === 0 ? teamA : teamB;
      events.push({ minute: m, text: `GOAL! ${scorer} find the back of the net!`, type: 'goal' });
    } else {
      const pool = phase % 3 === 0 ? attackPhrases : phase % 3 === 1 ? defPhrases : tacticalPhrases;
      events.push({
        minute: m,
        text: pool[Math.floor(Math.random() * pool.length)],
        type: phase % 3 === 0 ? 'attack' : phase % 3 === 1 ? 'defense' : 'tactical',
      });
    }
    phase++;
  }
  return events;
}

function EventTicker({ events, currentIndex }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [currentIndex]);

  return (
    <div
      ref={containerRef}
      className="rounded-xl overflow-y-auto space-y-1.5 p-3"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        maxHeight: '220px',
      }}>
      <AnimatePresence initial={false}>
        {events.slice(0, currentIndex + 1).map((ev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12, height: 0 }}
            animate={{ opacity: 1, x: 0, height: 'auto' }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-start gap-2 py-0.5">
            <span className="text-[11px] font-black tabular-nums text-slate-600 w-8 flex-shrink-0 pt-0.5"
              style={{ fontFamily: "'Rajdhani',sans-serif" }}>{ev.minute}'</span>
            <span className="text-[11px] flex-shrink-0">{EVENT_ICONS[ev.type] ?? EVENT_ICONS.default}</span>
            <p className={`text-[11px] leading-relaxed ${ev.type === 'goal' ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
              {ev.text}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export default function MatchDayEngine({ teamA, teamB, result, onComplete }) {
  const [stage,        setStage]        = useState('kickoff'); // kickoff | playing | fulltime | done
  const [eventIndex,   setEventIndex]   = useState(-1);
  const [liveHome,     setLiveHome]     = useState(0);
  const [liveAway,     setLiveAway]     = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [ww, setWw] = useState(0);
  const [wh, setWh] = useState(0);

  const events = result?.events?.length
    ? result.events
    : buildFallbackEvents(teamA, teamB, result ?? {});

  const finalHome = result?.home_goals ?? 0;
  const finalAway = result?.away_goals ?? 0;

  // Track window size for confetti
  useEffect(() => {
    setWw(window.innerWidth);
    setWh(window.innerHeight);
  }, []);

  useEffect(() => {
    if (!result) return;

    // Stage 0 → playing after 700ms
    const t1 = setTimeout(() => setStage('playing'), 700);

    // Stagger events across MATCH_DURATION_MS window
    const perEvent = MATCH_DURATION_MS / Math.max(events.length, 1);
    const timers = events.map((ev, i) => {
      return setTimeout(() => {
        setEventIndex(i);
        // Update live score if this is a goal event
        if (ev.type === 'goal') {
          // Compare minute position to determine which team scored
          const teamAGoalMinutes = [...Array(finalHome)].map((_, j) =>
            Math.floor(10 + (j + 1) * (80 / (finalHome + 1))));
          const isHomeGoal = teamAGoalMinutes.some(m => Math.abs(m - ev.minute) <= 4);
          if (isHomeGoal) {
            setLiveHome(p => Math.min(p + 1, finalHome));
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1500);
          } else {
            setLiveAway(p => Math.min(p + 1, finalAway));
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 1500);
          }
        }
      }, 700 + perEvent * i);
    });

    // Full-time after all events
    const t2 = setTimeout(() => {
      setStage('fulltime');
      setLiveHome(finalHome);
      setLiveAway(finalAway);
    }, 700 + MATCH_DURATION_MS);

    // Transition to result
    const t3 = setTimeout(() => {
      setStage('done');
      onComplete?.(result);
    }, 700 + MATCH_DURATION_MS + 1200);

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); timers.forEach(clearTimeout); };
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  const isComplete = stage === 'fulltime' || stage === 'done';

  return (
    <div className="relative space-y-4">
      {showConfetti && (
        <Confetti
          width={ww} height={wh}
          numberOfPieces={120}
          recycle={false}
          gravity={0.3}
          style={{ position: 'fixed', top: 0, left: 0, zIndex: 999, pointerEvents: 'none' }}
        />
      )}

      {/* Full-time banner */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-3 left-0 right-0 z-10 flex justify-center pointer-events-none">
            <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest text-emerald-400"
              style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}>
              ⚽ Full Time
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Match Clock with live scoreboard */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}>
        <MatchClock
          teamA={teamA} teamB={teamB}
          homeGoals={liveHome} awayGoals={liveAway}
          isComplete={isComplete}
          durationMs={MATCH_DURATION_MS}
        />
      </motion.div>

      {/* Event ticker */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}>
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mb-2 flex items-center gap-1.5">
          <Zap size={9} className="text-violet-500" />Match Events
        </p>
        <EventTicker events={events} currentIndex={eventIndex} />
      </motion.div>

      {/* Loading indicator */}
      {!isComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex items-center justify-center gap-2 py-2">
          <div className="w-3 h-3 rounded-full border-2 border-violet-500/30 border-t-violet-500 animate-spin" />
          <p className="text-[10px] text-slate-700 font-semibold tracking-wide">Simulation in progress…</p>
        </motion.div>
      )}
    </div>
  );
}

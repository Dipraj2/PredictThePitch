import React, { useState } from 'react';
import { Trophy, ArrowRight, ArrowLeft, Crown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import MatchCard from './MatchCard';
import PredictionModal from './PredictionModal';
import { getTeamLogo } from '../utils/teamUtils';

export default function DynamicBracket({ matches }) {
  const [celebrationWinner, setCelebrationWinner] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);

  const byId = Object.fromEntries(matches.map(m => [m.match_id, m]));

  const qf1 = byId['QF1'];
  const qf2 = byId['QF2'];
  const sf1 = byId['SF1'];
  const qf3 = byId['QF3'];
  const qf4 = byId['QF4'];
  const sf2 = byId['SF2'];
  const final = byId['F1'];

  return (
    <section className="mt-0 pb-12 px-4 w-full">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4))' }} />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Trophy size={13} className="text-yellow-400" />
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
              2025–26 UCL Bracket
            </span>
          </div>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.4), transparent)' }} />
        </div>

        <div className="overflow-x-auto pb-6 w-full">
          <div className="flex items-center justify-center gap-4 min-w-[960px]">

            <BracketColumn label="Quarter-Finals">
              <MatchCard match={qf1} compact onClick={setSelectedMatch} />
              <MatchCard match={qf2} compact onClick={setSelectedMatch} />
            </BracketColumn>

            <BracketConnector />

            <BracketColumn label="Semi-Final">
              <MatchCard match={sf1} compact onClick={setSelectedMatch} />
            </BracketColumn>

            <BracketConnector final />

            <div className="flex flex-col items-center gap-3 mx-2">
              <div className="flex items-center gap-2 mb-1">
                <Trophy size={16} className="text-yellow-400" />
                <span className="text-sm font-black text-yellow-400 uppercase tracking-widest"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                  Final
                </span>
                <Trophy size={16} className="text-yellow-400" />
              </div>
              <div className="relative group">
                <MatchCard
                  match={final}
                  compact={false}
                  onClick={setSelectedMatch}
                  onCelebrate={setCelebrationWinner}
                />
                <div className="absolute -inset-4 rounded-3xl blur-2xl opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-40 -z-10"
                  style={{ background: 'radial-gradient(circle, #eab308, transparent 70%)' }} />
              </div>
              <p className="text-[10px] text-slate-600 uppercase tracking-widest mt-1">
                Munich · May 30, 2026
              </p>
            </div>

            <BracketConnector final direction="left" />

            <BracketColumn label="Semi-Final" alignRight>
              <MatchCard match={sf2} compact onClick={setSelectedMatch} />
            </BracketColumn>

            <BracketConnector direction="left" />

            <BracketColumn label="Quarter-Finals" alignRight>
              <MatchCard match={qf3} compact onClick={setSelectedMatch} />
              <MatchCard match={qf4} compact onClick={setSelectedMatch} />
            </BracketColumn>

          </div>
        </div>

        <p className="text-center text-[11px] text-slate-700 mt-2 md:hidden">
          Swipe to view the full bracket
        </p>

        <div className="flex flex-wrap justify-center gap-5 mt-10">
          <LegendItem color="bg-emerald-500/30 border-emerald-500/40 text-emerald-300" label="Winner / Qualifier" />
          <LegendItem color="bg-violet-500/10 border-violet-500/20 text-violet-400" label="Penalty shootout" />
          <LegendItem color="bg-yellow-400/10 border-yellow-500/30 text-yellow-300" label="Champion" />
        </div>
      </div>

      <AnimatePresence>
        {selectedMatch && (
          <PredictionModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrationWinner && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
              onClick={() => setCelebrationWinner(null)}
            />

            <div className="absolute inset-0 pointer-events-none z-[61]">
              <Confetti
                width={typeof window !== 'undefined' ? window.innerWidth : 1000}
                height={typeof window !== 'undefined' ? window.innerHeight : 1000}
                recycle={true}
                numberOfPieces={400}
                gravity={0.15}
              />
            </div>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="relative z-[62] flex flex-col items-center bg-white/5 border border-white/10 rounded-3xl p-10 max-w-sm w-full shadow-2xl mx-4"
              style={{ backdropFilter: 'blur(24px)' }}
            >
              <button
                onClick={() => setCelebrationWinner(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>

              <div className="relative mb-2 mt-4 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)]">
                <Crown size={64} className="text-yellow-400 -rotate-12" />
              </div>

              <img
                src={getTeamLogo(celebrationWinner)}
                alt={celebrationWinner}
                className="w-48 h-48 object-contain drop-shadow-2xl my-6"
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />

              <div className="text-center">
                <p className="text-sm text-yellow-500 font-bold uppercase tracking-widest mb-1">2025-26 Champions</p>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                  {celebrationWinner}
                </h2>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}

function BracketColumn({ label, children, alignRight }) {
  return (
    <div className={`flex flex-col ${alignRight ? 'items-end' : 'items-start'} gap-6`}>
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 text-center w-full">{label}</p>
      <div className="flex flex-col gap-6">
        {children}
      </div>
    </div>
  );
}

function BracketConnector({ final = false, direction = 'right' }) {
  const Arrow = direction === 'left' ? ArrowLeft : ArrowRight;
  return (
    <div className="flex items-center justify-center mx-1" style={{ width: 36 }}>
      <div className="relative w-full flex items-center">
        {direction === 'right' && (
          <div className="flex-1 h-px"
            style={{ background: final ? 'rgba(234,179,8,0.35)' : 'rgba(139,92,246,0.35)' }} />
        )}
        <Arrow
          size={12}
          className={final ? 'text-yellow-600' : 'text-violet-700'}
          style={{ flexShrink: 0 }}
        />
        {direction === 'left' && (
          <div className="flex-1 h-px"
            style={{ background: final ? 'rgba(234,179,8,0.35)' : 'rgba(139,92,246,0.35)' }} />
        )}
      </div>
    </div>
  );
}

function LegendItem({ color, label }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-medium ${color}`}
      style={{ background: 'transparent' }}>
      <span className="w-2 h-2 rounded-full bg-current flex-shrink-0 opacity-80" />
      {label}
    </div>
  );
}

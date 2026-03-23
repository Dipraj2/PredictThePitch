import React from 'react';
import MatchCard from './MatchCard';
import { Trophy, Swords } from 'lucide-react';

/**
 * BracketView
 * Renders the full UCL bracket:
 *   Left QF  →  Left SF  →  FINAL  ←  Right SF  ←  Right QF
 *
 * On mobile (< md) the entire bracket scrolls horizontally.
 */
export default function BracketView({ data, onSelectMatch }) {
  const { leftQF, leftSF, rightQF, rightSF, final } = data;

  return (
    <section className="pb-24 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Section title */}
        <div className="flex items-center gap-3 mb-10">
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4))' }} />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <Swords size={14} className="text-violet-400" />
            <span className="text-sm font-semibold text-slate-300 uppercase tracking-widest">
              2025–26 UCL Bracket
            </span>
          </div>
          <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(139,92,246,0.4), transparent)' }} />
        </div>

        {/* Horizontal scroll wrapper (for mobile) */}
        <div className="overflow-x-auto pb-4">
          <div className="flex items-center justify-center gap-0 min-w-[900px]">

            {/* ═══ LEFT SIDE ═══ */}
            {/* Left Quarter-Finals */}
            <BracketColumn label="Quarter-Finals">
              {leftQF.map((match) => (
                <MatchCard key={match.id} match={match} onClick={onSelectMatch} side="left" />
              ))}
            </BracketColumn>

            {/* Connector L-QF → L-SF */}
            <ConnectorLines count={leftQF.length} direction="right" />

            {/* Left Semi-Finals */}
            <BracketColumn label="Semi-Finals">
              {leftSF.map((match) => (
                <MatchCard key={match.id} match={match} onClick={onSelectMatch} side="left" />
              ))}
            </BracketColumn>

            {/* Connector L-SF → Final */}
            <ConnectorLines count={1} direction="right" />

            {/* ═══ FINAL ═══ */}
            <div className="flex flex-col items-center gap-3 mx-3">
              <div className="flex items-center gap-2 mb-2">
                <Trophy size={14} className="text-yellow-400" />
                <span className="text-[11px] font-bold text-yellow-500 uppercase tracking-widest">Final</span>
              </div>
              <div className="relative">
                <MatchCard match={final} onClick={onSelectMatch} />
                {/* Trophy glow ring */}
                {final.team1.name !== 'TBD' && (
                  <div className="absolute -inset-3 rounded-2xl blur-xl opacity-30 pointer-events-none glow-winner" />
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="text-[10px] text-slate-600 uppercase tracking-widest">Munich • May 30, 2026</p>
              </div>
            </div>

            {/* Connector Final ← R-SF */}
            <ConnectorLines count={1} direction="left" />

            {/* Right Semi-Finals */}
            <BracketColumn label="Semi-Finals" alignRight>
              {rightSF.map((match) => (
                <MatchCard key={match.id} match={match} onClick={onSelectMatch} side="right" />
              ))}
            </BracketColumn>

            {/* Connector R-QF → R-SF */}
            <ConnectorLines count={rightQF.length} direction="left" />

            {/* Right Quarter-Finals */}
            <BracketColumn label="Quarter-Finals" alignRight>
              {rightQF.map((match) => (
                <MatchCard key={match.id} match={match} onClick={onSelectMatch} side="right" />
              ))}
            </BracketColumn>

          </div>
        </div>

        {/* Mobile hint */}
        <p className="text-center text-[11px] text-slate-600 mt-4 md:hidden">
          ← Scroll horizontally to view the full bracket →
        </p>
      </div>
    </section>
  );
}

/** Column wrapper for a bracket stage */
function BracketColumn({ label, children, alignRight }) {
  return (
    <div className={`flex flex-col items-${alignRight ? 'end' : 'start'} gap-8 mx-3`}>
      <span className="sr-only">{label}</span>
      <div className="flex flex-col gap-8">
        {children}
      </div>
    </div>
  );
}

/**
 * ConnectorLines
 * Vertical bracket connectors between stages.
 * direction: 'right' (left side) | 'left' (right side) for arrow tip direction.
 */
function ConnectorLines({ count, direction }) {
  return (
    <div className="flex flex-col items-center justify-center self-stretch mx-1" style={{ width: 32 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex-1 flex items-center justify-center relative" style={{ minHeight: 80 }}>
          <div className="w-full h-px" style={{ background: 'rgba(139,92,246,0.3)' }} />
          {/* Arrow tip */}
          <div
            className="absolute text-violet-600 text-xs"
            style={{ [direction === 'right' ? 'right' : 'left']: -4 }}
          >
            {direction === 'right' ? '›' : '‹'}
          </div>
        </div>
      ))}
    </div>
  );
}

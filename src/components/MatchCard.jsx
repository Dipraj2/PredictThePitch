import React, { useState } from 'react';
import { Shield, Swords } from 'lucide-react';
import { getTeamLogo, getShortName } from '../utils/teamUtils';

function TeamRow({ teamName, isWinner, score, isFinal, onTeamClick }) {
  const logoSrc = getTeamLogo(teamName);
  const [logoFailed, setLogoFailed] = useState(false);
  const shortName = getShortName(teamName);

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200
        ${isWinner ? 'bg-emerald-500/10' : 'opacity-45'}
        ${isFinal ? 'cursor-pointer hover:bg-white/10 hover:shadow-lg ring-1 ring-transparent hover:ring-white/20' : ''}
      `}
      onClick={(e) => {
        if (isFinal && onTeamClick) {
          e.stopPropagation();
          onTeamClick(teamName);
        }
      }}
    >
      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center">
        {logoSrc && !logoFailed ? (
          <img
            src={logoSrc}
            alt={shortName}
            className="w-8 h-8 object-contain drop-shadow-md"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <Shield
            size={22}
            className={isWinner ? 'text-emerald-400' : 'text-slate-600'}
          />
        )}
      </div>

      <span
        className={`flex-1 text-sm font-bold truncate leading-tight
          ${isWinner ? 'text-emerald-300' : 'text-slate-500'}`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {shortName}
      </span>

      {score !== undefined && (
        <span className={`text-sm font-black tabular-nums
          ${isWinner ? 'text-emerald-300' : 'text-slate-600'}`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export default function MatchCard({ match, compact = false, onClick, onCelebrate }) {
  const { team_a, team_b, aggregate, leg_1, leg_2, winner, note, stage } = match;

  const aIsWinner = winner === team_a;
  const bIsWinner = winner === team_b;

  const [aggA, aggB] = (aggregate ?? '? - ?').split('-').map(s => s.trim());

  return (
    <div
      className="group relative rounded-2xl overflow-hidden select-none cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/[0.08] hover:border-white/20"
      onClick={() => onClick && onClick(match)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.08)',
        minWidth: compact ? 200 : 230,
        maxWidth: compact ? 230 : 260,
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 60%)' }}
      />

      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
        <Swords size={11} className="text-violet-500" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-violet-400">
          {stage}
        </span>
      </div>

      <div className="mx-3 h-px bg-white/5 mb-2" />

      <div className="px-2 pb-1 relative z-10">
        {stage === 'Final' && (
          <p className="text-center text-[10px] text-yellow-400/90 animate-pulse uppercase tracking-widest mb-1.5 mt-0.5">
            Click the winner to celebrate
          </p>
        )}
        <TeamRow
          teamName={team_a}
          isWinner={aIsWinner}
          score={aggA}
          isFinal={stage === 'Final'}
          onTeamClick={(t) => { if (t === winner && onCelebrate) onCelebrate(t); }}
        />

        <div className="flex items-center gap-2 px-3">
          <div className="flex-1 h-px bg-white/5" />
          <div className="flex flex-col items-center">
            <span
              className="text-[22px] font-black leading-none tabular-nums"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {aggA} – {aggB}
            </span>
            <span className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">aggregate</span>
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <TeamRow
          teamName={team_b}
          isWinner={bIsWinner}
          score={aggB}
          isFinal={stage === 'Final'}
          onTeamClick={(t) => { if (t === winner && onCelebrate) onCelebrate(t); }}
        />
      </div>

      {(leg_1 || leg_2) && (
        <div className="flex justify-center gap-3 px-3 pt-2 pb-2">
          {leg_1 && (
            <div className="text-center">
              <p className="text-[9px] text-slate-600 uppercase tracking-wider">Leg 1</p>
              <p className="text-xs font-bold text-slate-400">{leg_1}</p>
            </div>
          )}
          {leg_2 && <div className="w-px bg-white/5 self-stretch" />}
          {leg_2 && (
            <div className="text-center">
              <p className="text-[9px] text-slate-600 uppercase tracking-wider">Leg 2</p>
              <p className="text-xs font-bold text-slate-400">{leg_2}</p>
            </div>
          )}
        </div>
      )}

      {note && (
        <div className="mx-3 mb-3">
          <div
            className="rounded-lg px-3 py-2 text-center"
            style={{
              background: stage === 'Final'
                ? 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(161,122,6,0.08))'
                : 'rgba(139,92,246,0.08)',
              border: stage === 'Final'
                ? '1px solid rgba(234,179,8,0.25)'
                : '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <p className={`text-[11px] font-semibold leading-snug
              ${stage === 'Final' ? 'text-yellow-300' : 'text-violet-300'}`}>
              {note}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Shield, Swords, Minus } from 'lucide-react';
import { getTeamLogo, getShortName } from '../utils/teamUtils';

/** Returns 'home' | 'away' | 'draw' */
function getOutcome(match) {
  if (match.fetchError) return 'error';
  if (match.home_goals > match.away_goals) return 'home';
  if (match.away_goals > match.home_goals) return 'away';
  return 'draw';
}

function TeamRow({ teamName, isWinner, isDraw, score, isFinal, onTeamClick }) {
  const logoSrc = getTeamLogo(teamName);
  const [logoFailed, setLogoFailed] = useState(false);
  const shortName = getShortName(teamName);

  const rowStyle = isDraw
    ? 'bg-slate-700/20'
    : isWinner
    ? 'bg-emerald-500/10'
    : 'opacity-45';

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ${rowStyle}
        ${isFinal ? 'cursor-pointer hover:bg-white/10 hover:shadow-lg ring-1 ring-transparent hover:ring-white/20' : ''}`}
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
          <Shield size={22} className={isWinner ? 'text-emerald-400' : 'text-slate-600'} />
        )}
      </div>

      <span
        className={`flex-1 text-sm font-bold truncate leading-tight
          ${isDraw ? 'text-slate-400' : isWinner ? 'text-emerald-300' : 'text-slate-500'}`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {shortName}
      </span>

      {score !== undefined && (
        <span
          className={`text-sm font-black tabular-nums
            ${isDraw ? 'text-slate-400' : isWinner ? 'text-emerald-300' : 'text-slate-600'}`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export default function MatchCard({ match, compact = false, onClick, onCelebrate }) {
  const {
    home_team, away_team,
    home_goals, away_goals,
    home_xg, away_xg,
    confidence,
    stage, fetchError,
  } = match;

  const outcome = getOutcome(match);
  const homeWins = outcome === 'home';
  const awayWins = outcome === 'away';
  const isDraw = outcome === 'draw';
  const hasError = outcome === 'error';

  return (
    <div
      className="group relative rounded-2xl overflow-hidden select-none cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/[0.08] hover:border-white/20"
      onClick={() => onClick && onClick(match)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        border: hasError ? '1px solid rgba(239,68,68,0.2)' : '1px solid rgba(255,255,255,0.08)',
        minWidth: compact ? 200 : 230,
        maxWidth: compact ? 230 : 260,
        boxShadow: hasError ? '0 10px 30px -10px rgba(239,68,68,0.1)' : '0 10px 30px -10px rgba(0,0,0,0.5)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 60%)' }}
      />

      {/* Stage label */}
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
        <Swords size={11} className={hasError ? "text-red-500" : "text-violet-500"} />
        <span className={`text-[10px] font-semibold uppercase tracking-widest ${hasError ? "text-red-400" : "text-violet-400"}`}>{stage}</span>
        {fetchError && (
          <span className="ml-auto text-[9px] text-red-400 font-bold uppercase tracking-wider">Error</span>
        )}
      </div>

      <div className="mx-3 h-px bg-white/5 mb-2" />

      <div className="px-2 pb-1 relative z-10">
        {/* Home team */}
        <TeamRow
          teamName={home_team}
          isWinner={homeWins}
          isDraw={isDraw || hasError}
          score={hasError ? undefined : home_goals}
          isFinal={stage === 'Final'}
          onTeamClick={(t) => { if (!isDraw && !hasError && t !== away_team && onCelebrate) onCelebrate(t); }}
        />

        {/* Scoreline or Error */}
        <div className="flex items-center gap-2 px-3 py-1">
          <div className="flex-1 h-px bg-white/5" />
          <div className="flex flex-col items-center">
            {hasError ? (
              <span className="text-[10px] text-red-400 uppercase tracking-widest font-semibold text-center leading-tight">
                {fetchError.length > 30 ? fetchError.substring(0, 27) + '...' : fetchError}
              </span>
            ) : isDraw ? (
              <div className="flex items-center gap-1">
                <Minus size={12} className="text-slate-500" />
                <span
                  className="text-[18px] font-black leading-none tabular-nums"
                  style={{
                    fontFamily: "'Rajdhani', sans-serif",
                    background: 'linear-gradient(135deg, #94a3b8, #64748b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {home_goals} – {away_goals}
                </span>
                <Minus size={12} className="text-slate-500" />
              </div>
            ) : (
              <span
                className="text-[22px] font-black leading-none tabular-nums"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  background: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {home_goals} – {away_goals}
              </span>
            )}
            {!hasError && (
              <span className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">
                {isDraw ? 'draw' : 'predicted'}
              </span>
            )}
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Away team */}
        <TeamRow
          teamName={away_team}
          isWinner={awayWins}
          isDraw={isDraw || hasError}
          score={hasError ? undefined : away_goals}
          isFinal={stage === 'Final'}
          onTeamClick={(t) => { if (!isDraw && !hasError && t !== home_team && onCelebrate) onCelebrate(t); }}
        />
      </div>

      {/* Draw chip */}
      {isDraw && (
        <div className="mx-3 mb-3 mt-1">
          <div
            className="rounded-lg px-3 py-1.5 text-center"
            style={{
              background: 'rgba(100,116,139,0.12)',
              border: '1px solid rgba(100,116,139,0.25)',
            }}
          >
            <p className="text-[11px] font-semibold text-slate-400">
              Even match — Draw predicted
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Shield, Swords, Minus } from 'lucide-react';
import { getTeamLogo, getShortName } from '../utils/teamUtils';

function TeamRow({ teamName, isWinner, score, onTeamClick }) {
  const logoSrc = getTeamLogo(teamName);
  const [logoFailed, setLogoFailed] = useState(false);
  const shortName = getShortName(teamName);

  const rowStyle = isWinner ? 'bg-emerald-500/10' : 'opacity-45';

  return (
    <div
      className={`flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 ${rowStyle}`}
      onClick={(e) => {
        if (onTeamClick) {
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
          ${isWinner ? 'text-emerald-300' : 'text-slate-500'}`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {shortName}
      </span>

      {score !== undefined && (
        <span
          className={`text-sm font-black tabular-nums
            ${isWinner ? 'text-emerald-300' : 'text-slate-600'}`}
          style={{ fontFamily: "'Rajdhani', sans-serif" }}
        >
          {score}
        </span>
      )}
    </div>
  );
}

export default function TwoLegTieCard({ match, compact = false, onClick }) {
  const {
    team_a, team_b,
    leg1_score, leg2_score, aggregate,
    advancing_team, won_on_penalties,
    leg1_team_a_xg, leg1_team_b_xg,
    leg2_team_a_xg, leg2_team_b_xg,
    confidence,
    stage, fetchError,
  } = match;

  const hasError = !!fetchError;
  const aWins = advancing_team === team_a;
  const bWins = advancing_team === team_b;

  // Split aggregate "3-2" into "3" and "2"
  const [aggA, aggB] = hasError ? [undefined, undefined] : (aggregate || "0-0").split('-').map(s => s.trim());

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
      <div className="flex items-center gap-1.5 px-3 pt-3 pb-1">
        <Swords size={11} className={hasError ? "text-red-500" : "text-violet-500"} />
        <span className={`text-[9px] font-semibold uppercase tracking-widest ${hasError ? "text-red-400" : "text-violet-400"} whitespace-nowrap`}>{stage}</span>
        {hasError && (
          <span className="ml-auto text-[8px] text-red-400 font-bold uppercase tracking-wider">Error</span>
        )}
      </div>

      <div className="mx-3 h-px bg-white/5 mb-2" />

      <div className="px-2 pb-1 relative z-10">
        <TeamRow teamName={team_a} isWinner={aWins} score={aggA} />

        <div className="flex items-center gap-2 px-3 py-1">
          <div className="flex-1 h-px bg-white/5" />
          <div className="flex flex-col items-center">
            {hasError ? (
              <span className="text-[10px] text-red-400 uppercase tracking-widest font-semibold text-center leading-tight">
                {fetchError.length > 30 ? fetchError.substring(0, 27) + '...' : fetchError}
              </span>
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
                {aggA} – {aggB}
              </span>
            )}
            {!hasError && (
              <span className="text-[9px] text-slate-600 uppercase tracking-widest mt-0.5">
                Aggregate
              </span>
            )}
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        <TeamRow teamName={team_b} isWinner={bWins} score={aggB} />
      </div>

      {/* Leg breakdown */}
      {!hasError && (leg1_score || leg2_score) && (
        <div className="flex justify-center gap-4 px-3 pt-1 pb-2 opacity-70">
          {leg1_score && (
            <div className="text-center">
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">Leg 1</p>
              <p className="text-[10px] font-bold text-slate-300">{leg1_score}</p>
            </div>
          )}
          {leg2_score && <div className="w-px bg-white/5 self-stretch" />}
          {leg2_score && (
            <div className="text-center">
              <p className="text-[8px] text-slate-500 uppercase tracking-wider">Leg 2</p>
              <p className="text-[10px] font-bold text-slate-300">{leg2_score}</p>
            </div>
          )}
        </div>
      )}

      {/* Penalty badge */}
      {!hasError && won_on_penalties && (
        <div className="mx-3 mb-3">
          <div
            className="rounded-lg px-3 py-1.5 text-center"
            style={{
              background: 'rgba(139,92,246,0.1)',
              border: '1px solid rgba(139,92,246,0.2)',
            }}
          >
            <p className="text-[10px] font-semibold text-violet-300 uppercase tracking-wider">
              (Adv. on Penalties)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

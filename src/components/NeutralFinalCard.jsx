import React, { useState } from 'react';
import { Shield, Trophy, Minus } from 'lucide-react';
import { getTeamLogo, getShortName } from '../utils/teamUtils';

export default function NeutralFinalCard({ match, compact = false, onClick, onCelebrate }) {
  const {
    team_a, team_b,
    team_a_goals, team_b_goals,
    team_a_xg, team_b_xg,
    team_a_win_prob, draw_prob, team_b_win_prob,
    champion, won_on_penalties,
    confidence,
    stage, fetchError,
  } = match;

  const hasError = !!fetchError;
  const aWins = champion === team_a;
  const bWins = champion === team_b;

  const [logoAFailed, setLogoAFailed] = useState(false);
  const [logoBFailed, setLogoBFailed] = useState(false);

  return (
    <div
      className="group relative rounded-2xl overflow-hidden select-none cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:bg-white/[0.08] hover:border-white/20"
      onClick={() => onClick && onClick(match)}
      style={{
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(16px)',
        border: hasError ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(234,179,8,0.25)',
        minWidth: compact ? 200 : 220,
        maxWidth: compact ? 230 : 260,
        boxShadow: hasError ? '0 10px 30px -10px rgba(239,68,68,0.1)' : '0 10px 40px -10px rgba(234,179,8,0.15)',
      }}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at center, rgba(234,179,8,0.08) 0%, transparent 70%)' }}
      />
      
      {/* Epic Header */}
      <div className="flex flex-col items-center pt-3 pb-2 px-3 relative">
        <Trophy size={16} className={hasError ? "text-red-400" : "text-yellow-400 mb-1"} />
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${hasError ? "text-red-400" : "text-yellow-400"}`}>
          {hasError ? 'API Error' : 'Grand Final'}
        </span>
      </div>

      <div className="mx-3 h-px bg-white/10 mb-3" />

      {/* Main Score Area */}
      <div className="px-3 pb-2 relative z-10">
        <div className="flex items-center justify-between gap-1">
          
          {/* Team A */}
          <div 
            className="flex flex-col items-center flex-1 cursor-pointer"
            onClick={(e) => { if (!hasError && champion && onCelebrate) { e.stopPropagation(); onCelebrate(champion); } }}
          >
            <div className={`w-10 h-10 flex items-center justify-center mb-1.5 rounded-full p-1.5 transition-all 
              ${aWins ? 'bg-yellow-400/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-white/5'}`}>
              {getTeamLogo(team_a) && !logoAFailed ? (
                <img
                  src={getTeamLogo(team_a)}
                  alt={team_a}
                  className="w-6 h-6 object-contain"
                  onError={() => setLogoAFailed(true)}
                />
              ) : (
                <Shield size={24} className={aWins ? 'text-yellow-400' : 'text-slate-500'} />
              )}
            </div>
            <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight ${aWins ? 'text-yellow-300' : 'text-slate-300'}`}>
              {getShortName(team_a)}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center px-1">
            {hasError ? (
              <span className="text-[9px] text-red-400 uppercase tracking-widest font-semibold text-center leading-tight">
                {fetchError.length > 25 ? fetchError.substring(0, 22) + '...' : fetchError}
              </span>
            ) : (
              <span
                className="text-2xl font-black leading-none tabular-nums tracking-tighter"
                style={{
                  fontFamily: "'Rajdhani', sans-serif",
                  background: 'linear-gradient(135deg, #fde047, #eab308)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {team_a_goals} – {team_b_goals}
              </span>
            )}
            {!hasError && (
              <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">
                Score
              </span>
            )}
          </div>

          {/* Team B */}
          <div 
            className="flex flex-col items-center flex-1 cursor-pointer"
            onClick={(e) => { if (!hasError && champion && onCelebrate) { e.stopPropagation(); onCelebrate(champion); } }}
          >
            <div className={`w-10 h-10 flex items-center justify-center mb-1.5 rounded-full p-1.5 transition-all 
              ${bWins ? 'bg-yellow-400/20 shadow-[0_0_15px_rgba(234,179,8,0.3)]' : 'bg-white/5'}`}>
              {getTeamLogo(team_b) && !logoBFailed ? (
                <img
                  src={getTeamLogo(team_b)}
                  alt={team_b}
                  className="w-6 h-6 object-contain"
                  onError={() => setLogoBFailed(true)}
                />
              ) : (
                <Shield size={20} className={bWins ? 'text-yellow-400' : 'text-slate-500'} />
              )}
            </div>
            <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight ${bWins ? 'text-yellow-300' : 'text-slate-300'}`}>
              {getShortName(team_b)}
            </span>
          </div>

        </div>
      </div>

      {/* Penalty details */}
      {!hasError && won_on_penalties && (
        <div className="mx-3 mt-1 mb-2">
          <div
            className="rounded-lg px-3 py-2 flex flex-col items-center justify-center gap-1"
            style={{
              background: 'linear-gradient(135deg, rgba(234,179,8,0.15), rgba(161,122,6,0.08))',
              border: '1px solid rgba(234,179,8,0.25)',
            }}
          >
            <p className="text-[9px] font-bold text-yellow-600 uppercase tracking-wider">
              (Won on Penalties)
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

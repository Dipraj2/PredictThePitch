import React, { useEffect, useRef } from 'react';
import { X, Trophy, TrendingUp, Cpu, ShieldCheck } from 'lucide-react';
import WinProbBar from './WinProbBar';
import { getTeamLogo } from '../utils/teamUtils';

export default function PredictionModal({ match, onClose }) {
  const overlayRef = useRef(null);
  const { stage, team_a, team_b, aggregate, leg_1, leg_2, winner,
    team_a_win_prob, team_b_win_prob,
    team_a_xg, team_b_xg, confidence: rawConfidence } = match;

  const probA = team_a_win_prob ?? (winner === team_a ? 68 : 32);
  const probB = team_b_win_prob ?? (winner === team_b ? 68 : 32);
  const confidence = rawConfidence ?? Math.min(99, Math.max(probA, probB) + 12);

  const handleBackdropClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div
      ref={overlayRef}
      onClick={handleBackdropClick}
      className="backdrop-enter fixed inset-0 z-[100] flex items-center justify-center p-4 py-8"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="modal-enter relative w-full max-w-lg rounded-2xl flex flex-col"
        style={{
          background: 'linear-gradient(145deg, rgba(30,27,75,0.98), rgba(15,23,42,0.98))',
          border: '1px solid rgba(139,92,246,0.25)',
          boxShadow: '0 0 60px rgba(139,92,246,0.2), 0 25px 50px rgba(0,0,0,0.6)',
          maxHeight: 'calc(100vh - 4rem)',
        }}
      >
        <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb, #38bdf8)' }} />

        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/[0.07]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu size={13} className="text-violet-400" />
              <span className="text-[11px] text-violet-400 font-semibold uppercase tracking-widest">Match Details</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">· {stage}</span>
            </div>
            <h2 className="text-xl font-black text-slate-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {team_a} <span className="text-violet-400">vs</span> {team_b}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors ml-4 flex-shrink-0"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4 overflow-y-auto flex-1">

          <section>
            <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-3">Final Aggregate Score</p>
              <div className="flex items-center justify-center gap-4 sm:gap-6 mt-2">
                <div className="flex-1 flex flex-col items-center">
                  <img src={getTeamLogo(team_a)} alt={team_a} className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-3 drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <p className={`text-center font-bold text-sm sm:text-base leading-tight ${winner === team_a ? 'text-emerald-400' : 'text-slate-300'}`}>{team_a}</p>
                </div>
                <div className="px-5 py-3 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-3xl sm:text-4xl font-black tabular-nums text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{aggregate}</span>
                </div>
                <div className="flex-1 flex flex-col items-center">
                  <img src={getTeamLogo(team_b)} alt={team_b} className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-3 drop-shadow-md" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                  <p className={`text-center font-bold text-sm sm:text-base leading-tight ${winner === team_b ? 'text-emerald-400' : 'text-slate-300'}`}>{team_b}</p>
                </div>
              </div>

              {(leg_1 || leg_2) && (
                <div className="flex justify-center gap-6 mt-4 border-t border-white/[0.04] pt-3">
                  {leg_1 && <p className="text-[11px] text-slate-400"><span className="uppercase text-[9px] font-bold text-slate-500 tracking-wider">Leg 1:</span> {leg_1}</p>}
                  {leg_2 && <p className="text-[11px] text-slate-400"><span className="uppercase text-[9px] font-bold text-slate-500 tracking-wider">Leg 2:</span> {leg_2}</p>}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Machine Learning Insights</h3>
            </div>

            <p className="text-[11px] text-slate-500 mb-3">Simulated win probability based on historical data:</p>
            <WinProbBar
              team1={{ abbr: team_a.substring(0, 3).toUpperCase(), name: team_a }}
              team2={{ abbr: team_b.substring(0, 3).toUpperCase(), name: team_b }}
              team1Pct={probA}
              team2Pct={probB}
            />

            {(team_a_xg != null || team_b_xg != null) && (
              <div className="flex justify-between mt-4 pt-3 border-t border-white/[0.05]">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-black text-slate-200" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{team_a_xg?.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">xG · {team_a}</span>
                </div>
                <div className="text-[10px] text-slate-600 uppercase tracking-widest self-center">Expected Goals</div>
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-lg font-black text-slate-200" style={{ fontFamily: "'Rajdhani',sans-serif" }}>{team_b_xg?.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">xG · {team_b}</span>
                </div>
              </div>
            )}
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck size={14} className="text-slate-400" />
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prediction Confidence</h3>
            </div>
            <div className="relative h-2.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: `${confidence}%`,
                  background: 'linear-gradient(90deg, #7c3aed, #38bdf8)',
                  boxShadow: '0 0 10px rgba(139,92,246,0.5)',
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-slate-600">Low</span>
              <span className="text-[11px] text-violet-400 font-semibold">{confidence}% confident</span>
              <span className="text-[11px] text-slate-600">High</span>
            </div>
          </section>

          <div
            className="rounded-xl px-5 py-4 flex items-center gap-4 glow-winner"
            style={{
              background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(161,122,6,0.06))',
              border: '1px solid rgba(234,179,8,0.25)',
            }}
          >
            <div className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(234,179,8,0.15)' }}>
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-[10px] text-yellow-600 font-semibold uppercase tracking-widest mb-0.5">
                {stage === 'Final' ? 'Tournament Champion' : 'Stage Winner'}
              </p>
              <p className="text-lg font-black text-yellow-300 flex items-center gap-2"
                style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {winner}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-black text-yellow-400" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                {Math.max(probA, probB)}%
              </p>
              <p className="text-[10px] text-yellow-700">win chance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

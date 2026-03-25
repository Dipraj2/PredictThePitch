import React, { useEffect, useRef } from 'react';
import { X, Trophy, TrendingUp, Cpu, Target, Activity } from 'lucide-react';
import WinProbBar from './WinProbBar';
import { getTeamLogo } from '../utils/teamUtils';

export default function PredictionModal({ match, onClose }) {
  const overlayRef = useRef(null);
  const isFinal = match.stage === 'Final';


  const {
    stage: currentStage,
    team_a, team_b,
    aggregate, advancing_team, leg1_score, leg2_score, // Two-leg
    team_a_goals, team_b_goals, champion, // Neutral Final
    team_a_win_prob, draw_prob, team_b_win_prob, // Neutral Final
    won_on_penalties,
    // New metrics
    home_xg, away_xg,
    team_a_xg, team_b_xg,
    leg1_team_a_xg, leg1_team_b_xg,
    leg2_team_a_xg, leg2_team_b_xg,
    confidence,
  } = match;

  // Resolve xG depending on terminology from different endpoints
  const finalXgA = team_a_xg ?? home_xg;
  const finalXgB = team_b_xg ?? away_xg;

  const aWins = isFinal ? champion === team_a : advancing_team === team_a;
  const bWins = isFinal ? champion === team_b : advancing_team === team_b;
  const winner = isFinal ? champion : advancing_team;

  // Format score based on stage
  let scoreLeft, scoreRight;
  if (isFinal) {
    scoreLeft = team_a_goals;
    scoreRight = team_b_goals;
  } else {
    [scoreLeft, scoreRight] = (aggregate || "0-0").split('-').map(s => s.trim());
  }

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
        <div className="h-1 w-full rounded-t-2xl" style={{ background: 'linear-gradient(90deg, #7c3aed, #2563eb, #38bdf8)' }} />

        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-white/[0.07]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Cpu size={13} className="text-violet-400" />
              <span className="text-[11px] text-violet-400 font-semibold uppercase tracking-widest">Match Prediction</span>
              <span className="text-[10px] text-slate-600 uppercase tracking-wider">· {currentStage}</span>
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

        <div className="px-6 py-4 space-y-5 overflow-y-auto flex-1">


          <section>
            <div className="rounded-xl px-4 py-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-center text-[10px] text-slate-500 font-semibold uppercase tracking-widest mb-4">
                Predicted {isFinal ? 'Scoreline' : 'Aggregate Score'}
              </p>

              <div className="flex items-center justify-between gap-1 sm:gap-6">
                {/* Team A */}
                <div className="flex-1 flex flex-col items-center min-w-0">
                  <img
                    src={getTeamLogo(team_a)}
                    alt={team_a}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-3 drop-shadow-md"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <p className={`text-center font-bold text-xs sm:text-base leading-tight px-1
                    ${aWins ? 'text-emerald-400' : 'text-slate-300'}`}
                  >
                    {team_a}
                  </p>
                  {aWins && (
                    <span className="mt-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      {isFinal ? 'Champion' : 'Advances'}
                    </span>
                  )}
                </div>

                {/* Score box */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[120px]">
                  <div className="px-3 py-3 sm:px-5 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col items-center justify-center shadow-inner">

                    {/* This span forces the numbers and dash to stay together */}
                    <span
                      className="text-2xl sm:text-4xl font-black tabular-nums text-white whitespace-nowrap"
                      style={{ fontFamily: "'Rajdhani', sans-serif" }}
                    >
                      {scoreLeft} – {scoreRight}
                    </span>

                    {typeof finalXgA === 'number' && typeof finalXgB === 'number' && (
                      /* This span forces the xG to stay together */
                      <span className="text-[9px] sm:text-[10px] text-slate-400 font-semibold tracking-widest mt-1 whitespace-nowrap">
                        (xG: {finalXgA.toFixed(2)}) – (xG: {finalXgB.toFixed(2)})
                      </span>
                    )}
                  </div>
                </div>

                {/* Team B */}
                <div className="flex-1 flex flex-col items-center min-w-0">
                  <img
                    src={getTeamLogo(team_b)}
                    alt={team_b}
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain mb-3 drop-shadow-md"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <p className={`text-center font-bold text-xs sm:text-base leading-tight px-1
                    ${bWins ? 'text-emerald-400' : 'text-slate-300'}`}
                  >
                    {team_b}
                  </p>
                  {bWins && (
                    <span className="mt-1 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                      {isFinal ? 'Champion' : 'Advances'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>


          {!isFinal && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Target size={14} className="text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Two-Leg Breakdown</h3>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-0 sm:gap-6 rounded-xl overflow-hidden bg-slate-900/30 border border-white/5 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
                <div className="flex-1 flex flex-col items-center text-center p-4">
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1.5">Leg 1</p>
                  <p className="text-2xl font-black text-slate-200 tabular-nums" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{leg1_score}</p>
                  {typeof leg1_team_a_xg === 'number' && (
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">(xG: {leg1_team_a_xg.toFixed(2)} - {leg1_team_b_xg.toFixed(2)})</p>
                  )}
                </div>
                <div className="flex-1 flex flex-col items-center text-center p-4">
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-1.5">Leg 2</p>
                  <p className="text-2xl font-black text-slate-200 tabular-nums" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{leg2_score}</p>
                  {typeof leg2_team_a_xg === 'number' && (
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">(xG: {leg2_team_a_xg.toFixed(2)} - {leg2_team_b_xg.toFixed(2)})</p>
                  )}
                </div>
              </div>
            </section>
          )}


          {isFinal && typeof team_a_win_prob === 'number' && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={14} className="text-slate-400" />
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Win Probability Breakdown</h3>
              </div>
              <p className="text-[11px] text-slate-500 mb-3">
                XGBoost model probability for each outcome:
              </p>
              <WinProbBar
                homeTeam={team_a}
                awayTeam={team_b}
                homePct={team_a_win_prob}
                drawPct={draw_prob}
                awayPct={team_b_win_prob}
              />
            </section>
          )}


          {typeof confidence === 'number' && (
            <section>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-slate-400" />
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Prediction Confidence</h3>
                </div>
                <span className={`text-xs font-black tracking-widest ${confidence > 60 ? 'text-emerald-400' :
                  confidence > 45 ? 'text-yellow-400' : 'text-slate-400'
                  }`}>
                  {confidence.toFixed(1)}%
                </span>
              </div>

              <p className="text-[10px] text-slate-500 mb-3 leading-relaxed">
                The machine learning model's overall confidence predicting this specific matchup based on historical data patterns and expected outcome probabilities.
              </p>

              <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                <div
                  className={`absolute top-0 left-0 bottom-0 transition-all duration-[1500ms] ease-out 
                    ${confidence > 60 ? 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.5)]' :
                      confidence > 45 ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]' :
                        'bg-gradient-to-r from-slate-600 to-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.5)]'
                    }`}
                  style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
                />
              </div>
            </section>
          )}


          <div
            className="rounded-xl px-5 py-4 flex items-center gap-4"
            style={{
              background: 'linear-gradient(135deg, rgba(234,179,8,0.12), rgba(161,122,6,0.06))',
              border: '1px solid rgba(234,179,8,0.25)',
            }}
          >
            <div
              className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(234,179,8,0.15)' }}
            >
              <Trophy size={20} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-0.5 text-yellow-600">
                {isFinal ? 'Tournament Champion' : 'Stage Winner'}
              </p>
              <div className="flex items-center gap-2">
                <p
                  className="text-lg font-black text-yellow-300"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {winner}
                </p>
                {won_on_penalties && (
                  <span className="text-[9px] font-bold text-violet-400 uppercase tracking-widest bg-violet-400/10 px-2 py-0.5 rounded-full border border-violet-400/20">
                    Penalties
                  </span>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

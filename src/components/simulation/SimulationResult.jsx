/**
 * SimulationResult.jsx
 * ─────────────────────
 * Renders the full prediction result panel after a simulation completes.
 * Reuses existing chart components: ConfidenceMeter, WinProbBar,
 * TeamStatRadar, ExplainabilityPanel.
 *
 * Props:
 *   result  object  — full API response from /api/simulate
 */
import React from 'react';
import { Target, TrendingUp, Activity } from 'lucide-react';
import ConfidenceMeter from '../ConfidenceMeter';
import WinProbBar from '../WinProbBar';
import TeamStatRadar from '../TeamStatRadar';
import ExplainabilityPanel from '../ExplainabilityPanel';
import NarrativeCard from './NarrativeCard';
import { getTeamLogo } from '../../utils/teamUtils';

function Section({ icon: Icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={13} className="text-slate-500" />
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export default function SimulationResult({ result }) {
  const {
    team_a, team_b,
    home_goals, away_goals,
    home_xg, away_xg,
    home_win_prob, draw_prob, away_win_prob,
    confidence,
    explanations,
    narrative,
    narrative_source,
  } = result;

  const homeWins = home_goals > away_goals;
  const awayWins = away_goals > home_goals;
  const isDraw   = home_goals === away_goals;
  const logoA    = getTeamLogo(team_a);
  const logoB    = getTeamLogo(team_b);

  return (
    <div className="space-y-6" style={{ animation: 'slideUp 0.4s cubic-bezier(0.22,1,0.36,1)' }}>

      {/* ── Scoreline ─────────────────────────────────────────────────────── */}
      <div
        className="rounded-2xl p-5"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-4">
          Simulated Scoreline
        </p>
        <div className="flex items-center justify-between gap-4">
          {/* Team A */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {logoA ? (
              <img src={logoA} alt={team_a} className="w-14 h-14 object-contain drop-shadow"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black text-slate-500"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {team_a.slice(0, 2).toUpperCase()}
              </div>
            )}
            <p className={`text-center text-xs font-bold leading-tight ${homeWins ? 'text-emerald-400' : 'text-slate-400'}`}>
              {team_a}
            </p>
            {homeWins && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Winner</span>}
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1">
            <span
              className="text-4xl font-black text-white tabular-nums"
              style={{ fontFamily: "'Rajdhani', sans-serif" }}
            >
              {home_goals} – {away_goals}
            </span>
            {typeof home_xg === 'number' && (
              <span className="text-[10px] text-slate-500 font-semibold tracking-widest whitespace-nowrap">
                xG: {home_xg.toFixed(2)} – {away_xg.toFixed(2)}
              </span>
            )}
            {isDraw && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Draw</span>}
          </div>

          {/* Team B */}
          <div className="flex-1 flex flex-col items-center gap-2">
            {logoB ? (
              <img src={logoB} alt={team_b} className="w-14 h-14 object-contain drop-shadow"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center text-sm font-black text-slate-500"
                style={{ background: 'rgba(255,255,255,0.06)' }}>
                {team_b.slice(0, 2).toUpperCase()}
              </div>
            )}
            <p className={`text-center text-xs font-bold leading-tight ${awayWins ? 'text-emerald-400' : 'text-slate-400'}`}>
              {team_b}
            </p>
            {awayWins && <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Winner</span>}
          </div>
        </div>
      </div>

      {/* ── Confidence Meter ──────────────────────────────────────────────── */}
      {typeof confidence === 'number' && (
        <Section icon={Activity} title="Prediction Confidence">
          <div className="flex justify-center">
            <ConfidenceMeter confidence={confidence} />
          </div>
        </Section>
      )}

      {/* ── Win Probability ───────────────────────────────────────────────── */}
      {typeof home_win_prob === 'number' && (
        <Section icon={TrendingUp} title="Win Probability">
          <WinProbBar
            homeTeam={team_a} awayTeam={team_b}
            homePct={home_win_prob} drawPct={draw_prob} awayPct={away_win_prob}
          />
        </Section>
      )}

      {/* ── Team Radar ────────────────────────────────────────────────────── */}
      {explanations && (
        <Section icon={Target} title="Team Strength Radar">
          <div className="rounded-xl px-2 py-2"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <TeamStatRadar teamA={team_a} teamB={team_b} explanations={explanations} />
          </div>
        </Section>
      )}

      {/* ── Explainability ────────────────────────────────────────────────── */}
      {explanations && (
        <ExplainabilityPanel explanations={explanations} teamA={team_a} teamB={team_b} />
      )}

      {/* ── Narrative ─────────────────────────────────────────────────────── */}
      {narrative && (
        <NarrativeCard narrative={narrative} narrativeSource={narrative_source} />
      )}
    </div>
  );
}

/**
 * TeamStatRadar.jsx
 * ─────────────────
 * Recharts RadarChart comparing two teams across 5 statistical axes.
 * Data is derived from the `explanations` feature importance weights,
 * re-mapped to meaningful radar axes.
 *
 * Props:
 *   teamA        string — Team A name
 *   teamB        string — Team B name
 *   explanations object — { "Home Attack": 0.24, ... }
 */

import React from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  Legend,
} from 'recharts';

/**
 * Maps explanations keys → radar axis values (0–100 scale).
 * Home and Away features are extracted separately, then normalised per-axis
 * relative to each other so we can compare teams visually.
 */
function buildRadarData(explanations) {
  if (!explanations) return null;

  const e = explanations;
  // Raw weights, normalised to 0-100 relative to the pair
  function score(homeKey, awayKey) {
    const h = e[homeKey] ?? 0;
    const a = e[awayKey] ?? 0;
    const total = h + a || 1;
    return {
      home: parseFloat(((h / total) * 100).toFixed(1)),
      away: parseFloat(((a / total) * 100).toFixed(1)),
    };
  }

  const attack = score('Home Attack', 'Away Attack');
  const defense = score('Home Defense', 'Away Defense');
  const form = score('Home Form', 'Away Form');
  const goalDiff = score('Home Goal Diff', 'Away Goal Diff');

  // xG: use attack proxy (no separate xG key in explanations)
  return [
    { axis: 'Attack',    home: attack.home,   away: attack.away },
    { axis: 'Defense',   home: defense.home,  away: defense.away },
    { axis: 'Form',      home: form.home,     away: form.away },
    { axis: 'Goal Diff', home: goalDiff.home, away: goalDiff.away },
    // Composite: average of all — "overall dominance"
    {
      axis: 'Overall',
      home: parseFloat(((attack.home + defense.home + form.home + goalDiff.home) / 4).toFixed(1)),
      away: parseFloat(((attack.away + defense.away + form.away + goalDiff.away) / 4).toFixed(1)),
    },
  ];
}

export default function TeamStatRadar({ teamA, teamB, explanations }) {
  const data = buildRadarData(explanations);

  if (!data) {
    return (
      <div className="text-center text-xs text-slate-600 py-4">
        Radar data unavailable
      </div>
    );
  }

  const shortA = teamA?.split(' ')[0] ?? 'Home';
  const shortB = teamB?.split(' ')[0] ?? 'Away';

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <PolarGrid
            stroke="rgba(255,255,255,0.07)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }}
          />

          {/* Team A — violet */}
          <Radar
            name={shortA}
            dataKey="home"
            stroke="#7c3aed"
            fill="#7c3aed"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ r: 3, fill: '#a78bfa' }}
            isAnimationActive={true}
            animationDuration={900}
          />

          {/* Team B — sky */}
          <Radar
            name={shortB}
            dataKey="away"
            stroke="#0284c7"
            fill="#0284c7"
            fillOpacity={0.18}
            strokeWidth={2}
            dot={{ r: 3, fill: '#38bdf8' }}
            isAnimationActive={true}
            animationDuration={1100}
          />

          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '4px' }}
          />
        </RadarChart>
      </ResponsiveContainer>

      <p className="text-[9px] text-slate-700 text-center uppercase tracking-widest mt-1">
        Relative team strengths · derived from model weights
      </p>
    </div>
  );
}

/**
 * ExplainabilityPanel.jsx
 * ───────────────────────
 * Visualises XGBoost feature importance weights as an animated horizontal bar
 * chart. Color-coded: violet tones for home-side features, sky/blue for away.
 *
 * Props:
 *   explanations  object | undefined  — { "Home Attack": 0.24, "Away Form": 0.11, ... }
 *   teamA         string              — home team name (for legend)
 *   teamB         string              — away team name (for legend)
 */

import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Sparkles } from 'lucide-react';

const HOME_FEATURES = new Set(['Home Attack', 'Home Defense', 'Home Goal Diff', 'Home Form']);

/** Recharts custom tooltip */
function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0].payload;
  return (
    <div
      className="px-3 py-2 rounded-lg text-xs font-semibold"
      style={{
        background: 'rgba(15,23,42,0.95)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: '#e2e8f0',
      }}
    >
      <span className="text-slate-400">{name}: </span>
      <span className="text-white">{(value * 100).toFixed(1)}%</span>
    </div>
  );
}

export default function ExplainabilityPanel({ explanations, teamA, teamB }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!explanations || Object.keys(explanations).length === 0) {
    return (
      <div className="rounded-xl px-4 py-4 text-center text-xs text-slate-600"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
        Explainability data unavailable
      </div>
    );
  }

  // Sort by importance descending
  const data = Object.entries(explanations)
    .sort((a, b) => b[1] - a[1])
    .map(([name, value]) => ({ name, value: animated ? value : 0 }));

  const maxVal = Math.max(...data.map(d => d.value));

  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-violet-400" />
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Model Decision Factors
          </h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
            <span className="text-slate-500 truncate max-w-[60px]">{teamA?.split(' ')[0]}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
            <span className="text-slate-500 truncate max-w-[60px]">{teamB?.split(' ')[0]}</span>
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <ResponsiveContainer width="100%" height={data.length * 34 + 8}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          barSize={14}
        >
          <XAxis
            type="number"
            domain={[0, maxVal * 1.15]}
            hide
          />
          <YAxis
            type="category"
            dataKey="name"
            width={108}
            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Bar
            dataKey="value"
            radius={[0, 6, 6, 0]}
            isAnimationActive={true}
            animationDuration={900}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={
                  HOME_FEATURES.has(entry.name)
                    ? 'url(#violetGrad)'
                    : 'url(#skyGrad)'
                }
              />
            ))}
          </Bar>

          {/* Gradient defs */}
          <defs>
            <linearGradient id="violetGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#6d28d9" />
              <stop offset="100%" stopColor="#a78bfa" />
            </linearGradient>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0369a1" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      <p className="text-[9px] text-slate-700 text-center mt-3 uppercase tracking-widest">
        XGBoost gain-based feature importance · normalised
      </p>
    </div>
  );
}

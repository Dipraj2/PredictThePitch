/**
 * ConfidenceMeter.jsx
 * ───────────────────
 * Renders a glowing Recharts RadialBarChart arc as a confidence gauge.
 * Replaces the flat <div> progress bar in PredictionModal.
 *
 * Props:
 *   confidence  number  — value 0–100
 */

import React from 'react';
import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts';

function getColor(confidence) {
  if (confidence > 60) return { start: '#10b981', end: '#34d399', glow: 'rgba(52,211,153,0.6)' };
  if (confidence > 45) return { start: '#d97706', end: '#fbbf24', glow: 'rgba(251,191,36,0.5)' };
  return { start: '#475569', end: '#94a3b8', glow: 'rgba(148,163,184,0.4)' };
}

function getLabel(confidence) {
  if (confidence > 65) return 'High';
  if (confidence > 50) return 'Moderate';
  if (confidence > 38) return 'Low';
  return 'Uncertain';
}

export default function ConfidenceMeter({ confidence = 0 }) {
  const pct = Math.min(100, Math.max(0, confidence));
  const colors = getColor(pct);
  const label = getLabel(pct);

  // RadialBarChart needs data as fraction 0–1 of the full arc
  const data = [
    { value: pct, fill: 'url(#confGrad)' },
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: 110, height: 66 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="92%"
            innerRadius="75%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={data}
            barSize={10}
          >
            {/* Background track */}
            <RadialBar
              dataKey="value"
              cornerRadius={5}
              background={{ fill: 'rgba(255,255,255,0.04)' }}
              isAnimationActive={true}
              animationDuration={1200}
              animationEasing="ease-out"
              max={100}
            />
            <defs>
              <linearGradient id="confGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={colors.start} />
                <stop offset="100%" stopColor={colors.end} />
              </linearGradient>
            </defs>
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Percentage label in the middle of the arc */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col items-center"
          style={{ marginBottom: '-2px' }}
        >
          <span
            className="text-lg font-black leading-none"
            style={{
              fontFamily: "'Rajdhani', sans-serif",
              color: colors.end,
              textShadow: `0 0 12px ${colors.glow}`,
            }}
          >
            {pct.toFixed(1)}%
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

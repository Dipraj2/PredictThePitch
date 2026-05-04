/**
 * SimulationSkeleton.jsx
 * ──────────────────────
 * Shimmer skeleton shown while simulation is loading.
 */
import React from 'react';

function Bone({ className = '', style = {} }) {
  return (
    <div
      className={`rounded-lg ${className}`}
      style={{ background: 'rgba(255,255,255,0.05)', animation: 'shimmer 1.5s ease-in-out infinite', ...style }}
    />
  );
}

export default function SimulationSkeleton() {
  return (
    <div className="space-y-6">
      {/* Score card */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <Bone className="h-3 w-24 mx-auto mb-4" />
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <Bone className="w-14 h-14 rounded-full" />
            <Bone className="h-3 w-20" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <Bone className="h-10 w-20" />
            <Bone className="h-2 w-24" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <Bone className="w-14 h-14 rounded-full" />
            <Bone className="h-3 w-20" />
          </div>
        </div>
      </div>

      {/* Confidence */}
      <div className="flex justify-center">
        <Bone className="w-28 h-16 rounded-xl" />
      </div>

      {/* Win prob */}
      <Bone className="h-12 w-full rounded-xl" />

      {/* Narrative */}
      <div className="rounded-2xl p-5 space-y-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
        <Bone className="h-3 w-32" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-3/5" />
      </div>
    </div>
  );
}

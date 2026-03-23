import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DynamicBracket from './components/DynamicBracket';

// ─── Data import ──────────────────────────────────────────────────────────────
// Primary import from the local JSON file.
// Vite resolves JSON imports natively; no extra plugin needed.
import matchData from './data/predictions.json';

export default function App() {
  return (
    <div
      className="min-h-screen flex flex-col w-full bg-slate-950"
      style={{ background: 'linear-gradient(180deg, #050810 0%, #0f172a 25%, #0c1526 100%)' }}
    >
      {/* Navigation */}
      <Header />

      {/* Main content — flex-grow so footer stays at bottom, no overflow constraints */}
      <main className="flex-grow w-full">
        <HeroSection />

        {/* Dynamic tournament bracket — driven entirely by predictions.json */}
        <DynamicBracket matches={matchData} />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 text-center">
        <p className="text-xs text-slate-700">
          PredictThePitch · Results sourced from{' '}
          <code className="text-slate-600">Football Matches Dataset 2025 by Tarek Masry on Kaggle</code> · For entertainment only.
        </p>
        <p className="text-xs text-slate-800 mt-1">© 2026 · Artim007</p>
      </footer>
    </div>
  );
}

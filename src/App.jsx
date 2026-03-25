import React from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DynamicBracket from './components/DynamicBracket';
import AboutAI from './components/AboutAI';
import { useBracketPredictions } from './hooks/useBracketPredictions';

export default function App() {
  const { matches, isLoading, error, retry } = useBracketPredictions();

  return (
    <div
      className="min-h-screen flex flex-col w-full bg-slate-950"
      style={{ background: 'linear-gradient(180deg, #050810 0%, #0f172a 25%, #0c1526 100%)' }}
    >
      {/* Navigation */}
      <Header />

      {/* Main content */}
      <main className="flex-grow w-full">
        <HeroSection />
        <DynamicBracket matches={matches} isLoading={isLoading} error={error} onRetry={retry} />
        <AboutAI />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-8 text-center">
        <p className="text-xs text-slate-700">
          PredictThePitch · Predictions powered by{' '}
          <code className="text-slate-600">XGBoost ML Model</code> · For entertainment only.
        </p>
        <p className="text-xs text-slate-800 mt-1">© 2026 · Artim007</p>
      </footer>
    </div>
  );
}

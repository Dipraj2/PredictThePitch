import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DynamicBracket from './components/DynamicBracket';
import AboutAI from './components/AboutAI';
import SimulatePage from './pages/SimulatePage';
import { useBracketPredictions } from './hooks/useBracketPredictions';

// Page transition wrapper
function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}

function BracketPage() {
  const { matches, isLoading, error, dataSource, retry } = useBracketPredictions();
  return (
    <PageTransition>
      <HeroSection />
      <DynamicBracket matches={matches} isLoading={isLoading} error={error} onRetry={retry} dataSource={dataSource} />
      <AboutAI />
    </PageTransition>
  );
}

export default function App() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col w-full"
      style={{ background: 'linear-gradient(180deg, #050810 0%, #0f172a 25%, #0c1526 100%)' }}
    >
      <Header />

      <main className="flex-grow w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<BracketPage />} />
            <Route path="/simulate" element={
              <PageTransition>
                <SimulatePage />
              </PageTransition>
            } />
          </Routes>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/[0.04] py-8 text-center">
        <p className="text-xs font-semibold"
          style={{ background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          PredictThePitch
        </p>
        <p className="text-xs text-slate-700 mt-1">
          Predictions powered by{' '}
          <code className="text-slate-600">XGBoost·Recharts·FastAPI</code>
          {' '}· For entertainment only.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[10px] text-slate-800">© 2026 · Artim007</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full text-slate-700"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            v3.0
          </span>
        </div>
      </footer>
    </div>
  );
}

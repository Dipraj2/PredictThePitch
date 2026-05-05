import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import DynamicBracket from './components/DynamicBracket';
import AboutAI from './components/AboutAI';
import SimulatePage from './pages/SimulatePage';
import DashboardPage from './pages/DashboardPage';
import LeagueSimulatePage from './pages/LeagueSimulatePage';
import DreamSimulatePage from './pages/DreamSimulatePage';
import TournamentPage from './pages/TournamentPage';
import ProtectedRoute from './components/ProtectedRoute';
import AuthModal from './components/auth/AuthModal';
import { useBracketPredictions } from './hooks/useBracketPredictions';
import { useAuth } from './context/AuthContext';

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
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Handle ?auth=login query param (from ProtectedRoute redirect)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('auth') === 'login') {
      setShowAuthModal(true);
    }
  }, [location.search]);

  // After login, check if there's a ?from= param to redirect to
  useEffect(() => {
    if (user) {
      const params = new URLSearchParams(location.search);
      const from   = params.get('from');
      if (from) {
        navigate(decodeURIComponent(from), { replace: true });
      }
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="min-h-screen flex flex-col w-full"
      style={{ background: 'linear-gradient(180deg, #050810 0%, #0f172a 25%, #0c1526 100%)' }}
    >
      <Header onOpenAuth={() => setShowAuthModal(true)} />

      <main className="flex-grow w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes */}
            <Route path="/" element={<BracketPage />} />
            <Route path="/simulate" element={
              <PageTransition><SimulatePage /></PageTransition>
            } />

            {/* Mode routes — auth preferred but not required */}
            <Route path="/simulate/league" element={
              <PageTransition><LeagueSimulatePage /></PageTransition>
            } />
            <Route path="/simulate/dream" element={
              <PageTransition><DreamSimulatePage /></PageTransition>
            } />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <PageTransition><DashboardPage /></PageTransition>
              </ProtectedRoute>
            } />
            <Route path="/tournament" element={
              <ProtectedRoute>
                <PageTransition><TournamentPage /></PageTransition>
              </ProtectedRoute>
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
          <code className="text-slate-600">XGBoost · Recharts · FastAPI</code>
          {' '}· For entertainment only.
        </p>
        <div className="flex items-center justify-center gap-2 mt-2">
          <span className="text-[10px] text-slate-800">© 2026 · Artim007</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full text-slate-700"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            v4.0
          </span>
        </div>
      </footer>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
}

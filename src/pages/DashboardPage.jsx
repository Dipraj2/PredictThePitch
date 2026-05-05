/**
 * DashboardPage.jsx
 * ─────────────────
 * Post-login landing page. Presents two primary simulation modes
 * and shows the user's last 5 simulation results.
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Globe, Zap, Clock, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const MODES = [
  {
    id: 'league',
    href: '/simulate/league',
    icon: Trophy,
    title: 'League Simulation',
    subtitle: 'Pick a real competition',
    description: 'Choose from UCL, Premier League, La Liga, Bundesliga, Ligue 1, or Serie A. Matchups are strictly filtered to teams in that league. A live points table updates as you simulate.',
    gradient: 'linear-gradient(135deg,rgba(245,158,11,0.18),rgba(239,68,68,0.12))',
    border: 'rgba(245,158,11,0.35)',
    glow: 'rgba(245,158,11,0.15)',
    iconColor: '#fbbf24',
    badge: '6 Competitions',
  },
  {
    id: 'dream',
    href: '/simulate/dream',
    icon: Globe,
    title: 'Dream Simulation',
    subtitle: 'Unrestricted sandbox',
    description: 'Pick any two teams from 194 clubs across 10 European leagues — regardless of their real-world league. Or build a full custom tournament with your dream 8-team bracket.',
    gradient: 'linear-gradient(135deg,rgba(139,92,246,0.18),rgba(37,99,235,0.12))',
    border: 'rgba(139,92,246,0.35)',
    glow: 'rgba(139,92,246,0.15)',
    iconColor: '#a78bfa',
    badge: '194 Teams',
  },
];

function ModeCard({ mode, index }) {
  const navigate = useNavigate();
  const Icon = mode.icon;
  return (
    <motion.button
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ scale: 1.025, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(mode.href)}
      className="relative w-full text-left rounded-3xl p-7 overflow-hidden group transition-all duration-300"
      style={{
        background: mode.gradient,
        border: `1px solid ${mode.border}`,
        boxShadow: `0 8px 40px ${mode.glow}`,
      }}
    >
      {/* Animated glow blob */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
        style={{ background: mode.glow }} />

      <div className="relative z-10 flex flex-col h-full gap-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid ${mode.border}` }}>
            <Icon size={22} style={{ color: mode.iconColor }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.07)', color: mode.iconColor, border: `1px solid ${mode.border}` }}>
            {mode.badge}
          </span>
        </div>

        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1"
            style={{ color: mode.iconColor }}>{mode.subtitle}</p>
          <h2 className="text-2xl font-black text-slate-100 mb-2"
            style={{ fontFamily: "'Rajdhani',sans-serif" }}>{mode.title}</h2>
          <p className="text-sm text-slate-400 leading-relaxed">{mode.description}</p>
        </div>

        <div className="flex items-center gap-1 mt-auto pt-2"
          style={{ color: mode.iconColor }}>
          <span className="text-xs font-bold">Enter Mode</span>
          <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </motion.button>
  );
}

function HistoryRow({ sim, idx }) {
  const homeWin = sim.home_goals > sim.away_goals;
  const awayWin = sim.away_goals > sim.home_goals;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + idx * 0.07, duration: 0.4 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-300 truncate">
          <span className={homeWin ? 'text-emerald-400' : ''}>{sim.team_a}</span>
          <span className="text-slate-600 mx-1.5 font-black tabular-nums"
            style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            {sim.home_goals} – {sim.away_goals}
          </span>
          <span className={awayWin ? 'text-emerald-400' : ''}>{sim.team_b}</span>
        </p>
        <p className="text-[10px] text-slate-700 mt-0.5">
          {sim.mode === 'league' ? `🏆 ${sim.league ?? 'League'}` : '🌍 Dream'} ·{' '}
          {sim.confidence ? `${sim.confidence.toFixed(0)}% confidence` : ''}
        </p>
      </div>
      <Clock size={11} className="text-slate-700 flex-shrink-0" />
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [histLoading, setHistLoading] = useState(true);

  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : '??';

  useEffect(() => {
    async function fetchHistory() {
      try {
        const { data } = await supabase
          .from('simulations')
          .select('id,team_a,team_b,home_goals,away_goals,confidence,mode,league,created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        setHistory(data ?? []);
      } catch (_) {
        setHistory([]);
      } finally {
        setHistLoading(false);
      }
    }
    fetchHistory();
  }, []);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="min-h-screen"
      style={{ background: 'linear-gradient(180deg,#050810 0%,#0f172a 40%,#0c1526 100%)' }}>

      {/* Top bar */}
      <div className="border-b border-white/[0.04] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-violet-300"
              style={{ background: 'linear-gradient(135deg,rgba(124,58,237,0.35),rgba(37,99,235,0.35))', border: '1px solid rgba(139,92,246,0.4)' }}>
              {initials}
            </div>
            <div>
              <p className="text-[10px] text-slate-600 font-semibold uppercase tracking-widest">Signed in as</p>
              <p className="text-sm font-bold text-slate-300 truncate max-w-[200px]">{user?.email}</p>
            </div>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10">
            <LogOut size={13} />
            Sign out
          </motion.button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-2">
            <Zap size={10} className="inline mr-1" />PredictThePitch Dashboard
          </p>
          <h1 className="text-4xl font-black text-slate-100" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
            Choose Your{' '}
            <span style={{ background: 'linear-gradient(90deg,#a78bfa,#60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Simulation Mode
            </span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            The XGBoost prediction engine is ready. Select a mode to begin.
          </p>
        </motion.div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {MODES.map((mode, i) => <ModeCard key={mode.id} mode={mode} index={i} />)}
        </div>

        {/* Recent history */}
        <div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <Clock size={10} className="inline mr-1.5" />Recent Simulations
            </p>
          </motion.div>

          {histLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl animate-pulse"
                  style={{ background: 'rgba(255,255,255,0.03)' }} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs text-slate-700 text-center py-6">
              No simulations yet. Pick a mode above to get started!
            </motion.p>
          ) : (
            <div className="space-y-2">
              {history.map((sim, i) => <HistoryRow key={sim.id} sim={sim} idx={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

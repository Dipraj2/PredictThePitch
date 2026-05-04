import React, { useState } from 'react';
import { Trophy, ChevronDown, Zap } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import AuthButton from './auth/AuthButton';

const NAV_LINKS = [
  { label: '2025-26 UCL', to: '/' },
  { label: 'Simulate', to: '/simulate', badge: 'New' },
  { label: 'About the Model', to: '/#about-ai' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 200], [1, 0]);

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/[0.06] bg-slate-950/80 backdrop-blur-md"
      style={{ opacity: headerOpacity }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <NavLink to="/" className="flex items-center gap-2.5 select-none">
            <div className="relative flex items-center justify-center w-14 h-14">
              <img src="/logo.png" alt="PredictThePitch" className="w-full h-full object-contain relative z-10" />
              <span className="absolute inset-0 rounded-full blur-md opacity-50"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)' }} />
            </div>
            <span className="text-xl font-black tracking-tight"
              style={{
                fontFamily: "'Rajdhani', sans-serif",
                background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #38bdf8)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.01em',
              }}>
              PredictThePitch
            </span>
          </NavLink>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${isActive ? 'text-violet-300 bg-violet-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`
                }
              >
                {link.label === 'Simulate' && <Zap size={13} />}
                {link.label}
                {link.badge && (
                  <span className="pulse-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Right side: Auth + Mobile toggle */}
          <div className="flex items-center gap-3">
            <AuthButton />
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              aria-label="Toggle menu"
            >
              <ChevronDown size={20} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-white/[0.06] pt-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${isActive ? 'text-violet-300 bg-violet-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`
                }
              >
                <div className="flex items-center gap-2">
                  {link.label === 'Simulate' && <Zap size={13} />}
                  {link.label}
                </div>
                {link.badge && (
                  <span className="pulse-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                    {link.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </motion.header>
  );
}

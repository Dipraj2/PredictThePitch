import React, { useState } from 'react';
import { Trophy, Zap, ChevronDown } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const NAV_LINKS = [
  { label: '2025-26 UCL', href: '#', active: true },
  { label: 'Future Competitions', href: '#', badge: 'Coming Soon' },
  { label: 'About the Model', href: '#' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Scroll animations for the header
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
          <div className="flex items-center gap-2.5 select-none">
            <div className="relative flex items-center justify-center w-14 h-14">
              {/* Dynamic Logo Image */}
              <img src="/logo.png" alt="PredictThePitch" className="w-full h-full object-contain relative z-10" />
              {/* Subtle backglow */}
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
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
                  ${link.active
                    ? 'text-violet-300 bg-violet-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                {link.label}
                {link.badge && (
                  <span className="pulse-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            <ChevronDown size={20} className={`transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-white/[0.06] pt-4 space-y-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${link.active
                    ? 'text-violet-300 bg-violet-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
              >
                {link.label}
                {link.badge && (
                  <span className="pulse-badge inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
                    style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
                    {link.badge}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}
      </div>
    </motion.header>
  );
}

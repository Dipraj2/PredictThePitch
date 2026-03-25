import React, { useEffect, useRef, useState } from 'react';
import { Cpu } from 'lucide-react';
import { motion, useScroll, useTransform, useMotionValue } from 'framer-motion';

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  top: `${Math.floor((i * 37 + 13) % 100)}%`,
  left: `${Math.floor((i * 53 + 7) % 100)}%`,
  size: Math.floor((i * 11) % 3) + 1,
  delay: `${(i * 0.3) % 3}s`,
}));

export default function HeroSection() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef(null);

  const { scrollY } = useScroll();

  // Fade only at the bottom of the hero section
  const fadeStart = useMotionValue(300);
  const fadeEnd = useMotionValue(500);

  useEffect(() => {
    const updateRange = () => {
      if (sectionRef.current) {
        const h = sectionRef.current.offsetHeight;
        fadeStart.set(h - 150);
        fadeEnd.set(h + 50);
      }
    };
    updateRange();
    window.addEventListener('resize', updateRange);
    return () => window.removeEventListener('resize', updateRange);
  }, [fadeStart, fadeEnd]);

  const titleY = useTransform(scrollY, (y) => {
    const start = fadeStart.get();
    const end = fadeEnd.get();
    const t = Math.min(1, Math.max(0, (y - start) / (end - start)));
    return t * -50;
  });

  const heroOpacity = useTransform(scrollY, (y) => {
    const start = fadeStart.get();
    const end = fadeEnd.get();
    return 1 - Math.min(1, Math.max(0, (y - start) / (end - start)));
  });

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={sectionRef} className="relative pt-10 pb-4">
      <div className="hero-grid absolute inset-0 pointer-events-none" />

      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(139,92,246,0.18) 0%, transparent 70%)',
        }}
      />

      {STARS.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            animationDelay: s.delay,
          }}
        />
      ))}

      <motion.div
        className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center"
        style={{ y: titleY, opacity: heroOpacity }}
      >
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest mb-6 transition-all duration-700
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.3)',
            color: '#a78bfa',
          }}
        >
          <Cpu size={13} />
          Machine Learning Powered
        </div>

        <h1
          className={`text-4xl sm:text-6xl font-black leading-tight mb-5 transition-all duration-700 delay-100
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
          style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: '-0.01em' }}
        >
          <span style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #a78bfa 40%, #60a5fa 80%, #38bdf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            2025–26 Champions League
          </span>
          <br />
          <span className="text-slate-100">Predictions</span>
        </h1>

        <p
          className={`text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed transition-all duration-700 delay-200
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          We trained our AI on thousands of past matches so it can learn exactly how different teams score. By running simulations of every single game, we give you realistic win chances and exact score predictions for the biggest matches in Europe.
        </p>

        <div
          className={`flex flex-wrap justify-center gap-6 mt-10 transition-all duration-700 delay-300
            ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
        >
          {[
            { value: '55.55%', label: 'Model Accuracy' },
            { value: '5321+', label: 'Matches Analyzed' },
            { value: 'xG', label: 'Expected Goals' },
          ].map((stat) => (
            <div key={stat.label} className="glass-card px-6 py-3 flex flex-col items-center">
              <span className="text-2xl font-black text-violet-300" style={{ fontFamily: "'Rajdhani',sans-serif" }}>
                {stat.value}
              </span>
              <span className="text-xs text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}

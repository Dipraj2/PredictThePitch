import React, { useState, useEffect } from 'react';

const LOADING_PHRASES = [
  'Initializing prediction engine...',
  'Fetching historical team form...',
  'Running XGBoost regressions...',
  'Calculating Expected Goals (xG)...',
  'Enforcing probability hierarchy...',
  'Finalizing match outcome...',
];

/* Simple SVG football (soccer ball) icon */
function FootballIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="#bbf7d0" strokeWidth="1.5" fill="rgba(0,0,0,0.3)" />
      <polygon
        points="12,5.5 14.5,8 13.5,11 10.5,11 9.5,8"
        fill="#86efac"
        opacity="0.9"
      />
      <polygon points="12,18.5 9.5,16 10.5,13 13.5,13 14.5,16" fill="#86efac" opacity="0.9" />
      <polygon points="5.5,9 8.5,9.5 9.5,12 7,14 4.5,12" fill="#86efac" opacity="0.9" />
      <polygon points="18.5,9 19.5,12 17,14 14.5,12 15.5,9.5" fill="#86efac" opacity="0.9" />
    </svg>
  );
}

/* Pitch marking lines rendered inside the progress bar */
function PitchMarkings() {
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Centre line */}
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Quarter lines */}
      <line x1="25%" y1="0" x2="25%" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      <line x1="75%" y1="0" x2="75%" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
      {/* Centre circle (ellipse to fit bar height) */}
      <ellipse cx="50%" cy="50%" rx="8%" ry="70%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
      {/* Left penalty box */}
      <rect x="0" y="20%" width="12%" height="60%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
      {/* Right penalty box */}
      <rect x="88%" y="20%" width="12%" height="60%" stroke="rgba(255,255,255,0.08)" strokeWidth="1" fill="none" />
    </svg>
  );
}

export default function BracketLoader() {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);

  /* Advance phrase every 1.5s with a brief fade */
  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false);
      setTimeout(() => {
        setPhraseIdx((prev) => (prev + 1) % LOADING_PHRASES.length);
        setFadeIn(true);
      }, 200);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  /* Simulate progress: fills to ~92% over 9s so it never falsely completes */
  useEffect(() => {
    const TARGET = 92;
    const DURATION_MS = 9000;
    const TICK_MS = 80;
    const steps = DURATION_MS / TICK_MS;
    const increment = TARGET / steps;

    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(TARGET, current + increment);
      setProgress(current);
      if (current >= TARGET) clearInterval(timer);
    }, TICK_MS);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full px-6 py-20 select-none">

      {/* Terminal header tag */}
      <div className="flex items-center gap-2 mb-8">
        <span
          className="inline-block w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#4ade80', boxShadow: '0 0 8px #4ade80' }}
        />
        <span
          className="text-[11px] font-bold uppercase tracking-[0.3em]"
          style={{ color: '#4ade80', fontFamily: "'Rajdhani', sans-serif" }}
        >
          ML Engine · Active
        </span>
      </div>

      {/* Progress bar container */}
      <div className="w-full max-w-xl relative">
        {/* Outer bar — pitch green background */}
        <div
          className="relative w-full h-5 rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(90deg, #052e16, #064e2a, #052e16)',
            border: '1px solid rgba(74,222,128,0.25)',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
          }}
        >
          {/* Subtle pitch markings */}
          <PitchMarkings />

          {/* Glowing neon green fill */}
          <div
            className="absolute top-0 left-0 h-full rounded-full transition-all duration-[80ms] ease-linear"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #166534, #22c55e, #4ade80)',
              boxShadow: '0 0 20px rgba(74,222,128,0.6), 0 0 40px rgba(74,222,128,0.2)',
            }}
          />

          {/* Rolling football at the leading edge */}
          {progress > 2 && (
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-[80ms] ease-linear"
              style={{ left: `calc(${progress}% - 12px)` }}
            >
              <FootballIcon className="w-5 h-5 animate-spin" style={{ animationDuration: '1.2s' }} />
            </div>
          )}
        </div>

        {/* Progress percentage */}
        <div className="flex justify-between items-center mt-2 px-0.5">
          <span className="text-[10px] text-slate-600 font-mono tabular-nums">
            {progress.toFixed(0)}%
          </span>
          <span className="text-[10px] text-slate-700 font-mono uppercase tracking-widest">
            Sequential Analysis
          </span>
        </div>
      </div>

      {/* Cycling technical text */}
      <div className="mt-6 h-6 flex items-center justify-center">
        <p
          className="text-[13px] font-medium tracking-wide transition-opacity duration-200"
          style={{
            color: '#94a3b8',
            fontFamily: "'Inter', sans-serif",
            opacity: fadeIn ? 1 : 0,
          }}
        >
          {LOADING_PHRASES[phraseIdx]}
        </p>
      </div>

      {/* Stage pipeline dots */}
      <div className="flex items-center gap-1.5 mt-8">
        {['QF', 'QF', 'QF', 'QF', 'SF', 'SF', 'F'].map((label, i) => {
          const activated = progress > (i / 6) * 92;
          return (
            <React.Fragment key={i}>
              <div
                className="flex flex-col items-center gap-1 transition-all duration-500"
              >
                <div
                  className="w-2 h-2 rounded-full transition-all duration-500"
                  style={{
                    background: activated ? '#4ade80' : 'rgba(255,255,255,0.08)',
                    boxShadow: activated ? '0 0 8px rgba(74,222,128,0.7)' : 'none',
                  }}
                />
                <span
                  className="text-[8px] font-bold uppercase tracking-widest transition-colors duration-500"
                  style={{ color: activated ? '#4ade80' : '#1e293b' }}
                >
                  {label}
                </span>
              </div>
              {i < 6 && (
                <div
                  className="w-4 h-px transition-all duration-500 mb-3"
                  style={{ background: activated ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.05)' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

    </div>
  );
}

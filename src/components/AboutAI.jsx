import React from 'react';
import { Brain, Database, GitBranch, Trophy, BarChart2, Zap, ChevronRight } from 'lucide-react';

const sections = [
  {
    id: 'architecture',
    icon: Brain,
    label: 'Section 01',
    title: 'The Architecture',
    content: [
      `At the core of this platform is a dual-model machine learning architecture powered by XGBoost (Extreme Gradient Boosting). Predicting football matches is inherently chaotic, so relying on a single algorithm often leads to conflicting results. To solve this, our engine separates the task into two distinct "brains."`,
      `The first brain is a set of XGBoost Regressors. Their only job is to calculate Expected Goals (xG) based on historical offensive and defensive power. The second brain is an XGBoost Classifier. It ignores the scoreline entirely and focuses strictly on calculating the exact probability of a Home Win, Draw, or Away Win.`,
    ],
  },
  {
    id: 'data-pipeline',
    icon: Database,
    label: 'Section 02',
    title: 'The Data Pipeline',
    content: [
      `The models are trained on a massive, combined dataset featuring years of historical UEFA Champions League matches, alongside thousands of domestic fixtures from Europe's top leagues (Premier League, La Liga, Bundesliga, Primeira Liga) spanning from 2023 to the current season.`,
      `Rather than just looking at static team names, the data is engineered into dynamic performance metrics. Before predicting a match, the system calculates each team's historical average goals scored, goals conceded, overall goal difference, and true win rate. This allows the AI to understand momentum and form, rather than just historical reputation.`,
    ],
  },
  {
    id: 'hierarchy',
    icon: GitBranch,
    label: 'Section 03',
    title: 'The Hierarchy Logic',
    content: [
      `In machine learning, models sometimes disagree. A regressor might predict a 2-2 draw based on expected goals, while the classifier strongly believes the away team has a 60% chance to win.`,
      `To prevent these contradictions, our API utilizes a strict "Hierarchy Enforcement" algorithm. The Classifier is treated as the ultimate authority. If the probability model predicts a definitive winner, but the raw goal prediction suggests a draw, the system mathematically intervenes and adjusts the final scoreline to align with the highest probability outcome. This ensures that every prediction presented to the user is mathematically sound and perfectly logically aligned.`,
    ],
  },
  {
    id: 'tournament',
    icon: Trophy,
    label: 'Section 04',
    title: 'Tournament Intelligence',
    content: [
      `Champions League football requires specific situational awareness. The model is specifically programmed to handle the nuances of tournament formats:`,
    ],
    bullets: [
      {
        label: 'Two-Legged Ties',
        text: `The engine predicts both fixtures independently, respecting home-field advantage for each leg, before combining the results into a final aggregate score.`,
      },
      {
        label: 'Neutral Venues',
        text: `For the Grand Final, home advantage is a statistical illusion. The system runs the simulation twice — swapping the home and away designations — and calculates the exact mathematical average of both simulations to simulate a true neutral-ground environment.`,
      },
    ],
  },
  {
    id: 'accuracy',
    icon: BarChart2,
    label: 'Section 05',
    title: 'Accuracy and Limitations',
    content: [
      `In football prediction, a blind guess yields a 33.3% accuracy rate. Professional sports betting syndicates typically peak around 54%. Through rigorous backtesting on hidden data, this XGBoost architecture consistently achieves a Win/Draw/Loss accuracy of over 55.55%, placing it squarely in the realm of professional-grade predictive analytics.`,
    ],
    callout: `Football remains unpredictable by nature. This tool is designed to highlight statistical probabilities, not guarantee future outcomes.`,
  },
];

const accentColor = (idx) => {
  const colors = [
    { border: 'rgba(139,92,246,0.4)', glow: 'rgba(139,92,246,0.07)', text: 'text-violet-400', bg: 'bg-violet-400/10' },
    { border: 'rgba(96,165,250,0.4)', glow: 'rgba(96,165,250,0.07)', text: 'text-blue-400', bg: 'bg-blue-400/10' },
    { border: 'rgba(52,211,153,0.4)', glow: 'rgba(52,211,153,0.07)', text: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { border: 'rgba(250,204,21,0.4)', glow: 'rgba(250,204,21,0.07)', text: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { border: 'rgba(244,114,182,0.4)', glow: 'rgba(244,114,182,0.07)', text: 'text-pink-400', bg: 'bg-pink-400/10' },
  ];
  return colors[idx % colors.length];
};

export default function AboutAI() {
  return (
    <section
      id="about-ai"
      className="relative w-full border-t border-white/[0.05]"
      style={{ background: 'linear-gradient(180deg, #0c1526 0%, #050810 100%)' }}
    >
      {/* Ambient glow blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="relative max-w-3xl mx-auto px-6 sm:px-10 py-24">

        {/* Page Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/5">
            <Zap size={11} className="text-violet-400" />
            <span className="text-[11px] font-bold text-violet-400 uppercase tracking-[0.2em]">Technical Documentation</span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight mb-5"
            style={{ fontFamily: "'Rajdhani', sans-serif" }}
          >
            How the Prediction<br />
            <span style={{
              background: 'linear-gradient(90deg, #a78bfa, #60a5fa, #38bdf8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Engine Works</span>
          </h1>
          <p className="text-base text-slate-400 max-w-xl leading-relaxed">
            A deep dive into the dual-model XGBoost architecture, training data pipeline, and hierarchy enforcement logic behind every prediction.
          </p>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

        {/* Content Sections */}
        <div className="flex flex-col gap-16">
          {sections.map((section, idx) => {
            const accent = accentColor(idx);
            const Icon = section.icon;
            return (
              <article key={section.id} id={section.id} className="group relative scroll-mt-24">
                {/* Left rail accent */}
                <div
                  className="absolute -left-6 top-0 bottom-0 w-px"
                  style={{ background: `linear-gradient(to bottom, ${accent.border}, transparent)` }}
                />

                {/* Label + Icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${accent.bg} border border-white/10`}>
                    <Icon size={15} className={accent.text} />
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-[0.25em] ${accent.text}`}>
                    {section.label}
                  </span>
                </div>

                {/* Section Title */}
                <h2
                  className="text-2xl font-black text-slate-100 mb-5 leading-snug"
                  style={{ fontFamily: "'Rajdhani', sans-serif" }}
                >
                  {section.title}
                </h2>

                {/* Body Text */}
                <div className="flex flex-col gap-4">
                  {section.content.map((para, i) => (
                    <p key={i} className="text-[15px] text-slate-400 leading-[1.85] font-normal">
                      {para}
                    </p>
                  ))}
                </div>

                {/* Bullet Points (Section 4) */}
                {section.bullets && (
                  <div className="mt-6 flex flex-col gap-4">
                    {section.bullets.map((b, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 p-4 rounded-xl"
                        style={{
                          background: `radial-gradient(ellipse at left, ${accent.glow}, transparent)`,
                          border: `1px solid ${accent.border.replace('0.4', '0.15')}`,
                        }}
                      >
                        <ChevronRight size={14} className={`${accent.text} flex-shrink-0 mt-[3px]`} />
                        <p className="text-[14px] text-slate-300 leading-relaxed">
                          <span className={`font-bold ${accent.text}`}>{b.label}: </span>
                          {b.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Callout / Blockquote (Section 5) */}
                {section.callout && (
                  <blockquote
                    className="mt-6 pl-5 py-4 pr-4 rounded-r-xl italic text-[14px] text-slate-300 leading-relaxed"
                    style={{
                      borderLeft: `3px solid ${accent.border}`,
                      background: accent.glow,
                    }}
                  >
                    {section.callout}
                  </blockquote>
                )}

                {/* Divider between sections */}
                {idx < sections.length - 1 && (
                  <div className="absolute -bottom-8 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                )}
              </article>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-20 rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(96,165,250,0.05))',
            border: '1px solid rgba(139,92,246,0.15)',
          }}
        >
          <p className="text-[11px] font-bold text-violet-400 uppercase tracking-[0.2em] mb-2">Ready to Explore?</p>
          <p className="text-slate-300 text-base font-medium leading-relaxed">
            Scroll up to see the live UCL bracket predictions generated by the engine described above.
          </p>
        </div>

      </div>
    </section>
  );
}

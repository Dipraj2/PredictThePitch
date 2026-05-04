/**
 * NarrativeCard.jsx
 * ─────────────────
 * Renders the LLM / template-generated match narrative with a typewriter
 * animation. Uses react-markdown for formatting.
 *
 * Props:
 *   narrative        string          — markdown narrative text
 *   narrativeSource  'llm'|'template'
 */
import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Mic2, Sparkles, FileText } from 'lucide-react';

export default function NarrativeCard({ narrative, narrativeSource }) {
  const [displayedChars, setDisplayedChars] = useState(0);
  const [done, setDone] = useState(false);

  // Typewriter effect — reveal chars progressively
  useEffect(() => {
    if (!narrative) return;
    setDisplayedChars(0);
    setDone(false);
    let i = 0;
    // Fast initial reveal (10 chars per tick) then slow down
    const interval = setInterval(() => {
      i += 8;
      setDisplayedChars(i);
      if (i >= narrative.length) {
        setDisplayedChars(narrative.length);
        setDone(true);
        clearInterval(interval);
      }
    }, 16);
    return () => clearInterval(interval);
  }, [narrative]);

  if (!narrative) return null;

  const displayed = narrative.slice(0, displayedChars);
  const isLLM = narrativeSource === 'llm';

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, rgba(15,23,42,0.8), rgba(30,27,75,0.6))',
        border: '1px solid rgba(139,92,246,0.2)',
        boxShadow: '0 4px 30px rgba(139,92,246,0.08)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 border-b border-white/5"
        style={{ background: 'rgba(139,92,246,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(139,92,246,0.2)' }}
          >
            <Mic2 size={14} className="text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-200" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              Commentator's Take
            </p>
            <p className="text-[9px] text-slate-600 uppercase tracking-widest">Match Narrative</p>
          </div>
        </div>

        {/* Source badge */}
        <span
          className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest"
          style={
            isLLM
              ? { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
              : { background: 'rgba(100,116,139,0.12)', color: '#94a3b8', border: '1px solid rgba(100,116,139,0.2)' }
          }
        >
          {isLLM ? <Sparkles size={8} /> : <FileText size={8} />}
          {isLLM ? 'AI Generated' : 'Template'}
        </span>
      </div>

      {/* Narrative body */}
      <div className="px-5 py-4">
        <div className="prose prose-invert prose-sm max-w-none"
          style={{
            '--tw-prose-body': '#94a3b8',
            '--tw-prose-headings': '#e2e8f0',
            '--tw-prose-bold': '#cbd5e1',
            fontSize: '13px',
            lineHeight: '1.75',
          }}
        >
          <ReactMarkdown>
            {displayed}
          </ReactMarkdown>
        </div>

        {/* Blinking cursor while typing */}
        {!done && (
          <span
            className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 align-middle"
            style={{ animation: 'pulseBadge 0.8s ease-in-out infinite' }}
          />
        )}
      </div>
    </div>
  );
}

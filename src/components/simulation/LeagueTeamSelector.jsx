/**
 * LeagueTeamSelector.jsx
 * ──────────────────────
 * Variant of TeamSelector that filters to a provided teams[] array
 * instead of the global ALL_TEAMS list.
 *
 * Props:
 *   teams    string[]  — filtered team list for this league
 *   value    string    — currently selected team name
 *   onChange fn        — called with new team name
 *   label    string    — "Home Team" | "Away Team"
 *   exclude  string    — team to exclude (prevents mirror picks)
 */
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { getTeamLogo } from '../../utils/teamUtils';

export default function LeagueTeamSelector({ teams = [], value, onChange, label, exclude }) {
  const [open,  setOpen]  = useState(false);
  const [query, setQuery] = useState('');
  const containerRef = useRef(null);

  const filtered = teams
    .filter(t => t !== exclude && t.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    function handler(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(team) { onChange(team); setOpen(false); setQuery(''); }
  function clear(e)     { e.stopPropagation(); onChange(''); setQuery(''); }

  const logo = value ? getTeamLogo(value) : null;

  return (
    <div ref={containerRef} className="relative w-full">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</p>

      <button
        type="button"
        id={`league-selector-${label.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: open ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: open ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
        }}>
        {logo && (
          <img src={logo} alt={value} className="w-6 h-6 object-contain flex-shrink-0"
            onError={e => { e.currentTarget.style.display = 'none'; }} />
        )}
        <span className={`flex-1 text-sm font-semibold truncate ${value ? 'text-slate-200' : 'text-slate-600'}`}>
          {value || `Select ${label}…`}
        </span>
        <div className="flex items-center gap-1">
          {value && (
            <span onClick={clear} className="p-0.5 rounded text-slate-600 hover:text-slate-300 transition-colors">
              <X size={12} />
            </span>
          )}
          <ChevronDown size={14}
            className={`text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 mt-2 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(15,23,42,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            maxHeight: '260px',
          }}>
          <div className="p-2 border-b border-white/5">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${teams.length} teams…`}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs text-slate-300 placeholder-slate-700 outline-none bg-white/5"
              />
            </div>
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-600 text-center">No teams found</p>
            ) : (
              filtered.map(team => {
                const tLogo = getTeamLogo(team);
                return (
                  <button key={team} type="button" onClick={() => select(team)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors hover:bg-white/5"
                    style={{ color: team === value ? '#a78bfa' : '#94a3b8' }}>
                    {tLogo ? (
                      <img src={tLogo} alt={team} className="w-5 h-5 object-contain flex-shrink-0"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <span className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-black text-slate-700"
                        style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {team.slice(0, 2).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate font-medium">{team}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

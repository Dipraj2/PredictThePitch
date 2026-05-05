/**
 * TeamSelector.jsx
 * ────────────────
 * Searchable combobox for selecting a team from the full 194-team list.
 * Shows team logo (where available) and full team name.
 *
 * Props:
 *   value       string   — currently selected team name
 *   onChange    fn       — called with new team name string
 *   label       string   — field label ("Home Team" / "Away Team")
 *   exclude     string   — team name to exclude from options (prevents mirror picks)
 */
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import { getTeamLogo } from '../../utils/teamUtils';

// Canonical team names from teams_df.csv — deduplicated, no informal aliases
const ALL_TEAMS = [
  // Premier League
  'Arsenal','Aston Villa','ABournemouth','Brentford','Brighton & Hove Albion',
  'Chelsea','Crystal Palace','Everton','Fulham','Ipswich Town',
  'Leicester City','Liverpool','Manchester City','Manchester United','Newcastle United',
  'Nottingham Forest','Southampton','Tottenham Hotspur','West Ham United','Wolverhampton Wanderers',
  // La Liga
  'Athletic Club','Club Atlético de Madrid','CA Osasuna','CD Leganés','Deportivo Alavés',
  'Barcelona','Getafe','Girona','RCD Espanyol de Barcelona','RCD Mallorca',
  'RC Celta de Vigo','Rayo Vallecano de Madrid','Real Betis Balompié','Real Madrid',
  'Real Sociedad de Fútbol','Real Valladolid','Sevilla','UD Las Palmas','Valencia','Villarreal',
  // Serie A
  'AC Milan','AC Monza','ACF Fiorentina','AS Roma','Atalanta BC',
  'Bologna 1909','Cagliari Calcio','Como 1907','Empoli','GenoaC',
  'Hellas Verona','Internazionale Milano','Juventus','Parma Calcio 1913','SS Lazio',
  'SSC Napoli','Torino','US Lecce','Udinese Calcio','Venezia',
  // Bundesliga
  '1. FSV Mainz 05','1. Heidenheim 1846','1. Union Berlin','Augsburg','Bayer 04 Leverkusen',
  'Bayern München','Borussia Dortmund','Borussia Mönchengladbach','Eintracht Frankfurt',
  'Holstein Kiel','RB Leipzig','SC Freiburg','St. Pauli 1910','SV Werder Bremen',
  'TSG 1899 Hoffenheim','VfB Stuttgart','VfL Bochum 1848','VfL Wolfsburg',
  // Ligue 1
  'AJ Auxerre','Angers SCO','AS Monaco','AS Saint-Étienne','Le Havre AC',
  'Lille OSC','Montpellier HSC','Nantes','OGC Nice','Olympique de Marseille',
  'Olympique Lyonnais','Paris Saint-Germain','Racing Club de Lens','RC Strasbourg Alsace',
  'Stade Brestois 29','Stade de Reims','Stade Rennais 1901','Toulouse',
  // Champions League / Others
  'AC Sparta Praha','BSC Young Boys','Celtic','Club Brugge KV','Feyenoord Rotterdam',
  'FK Bodø/Glimt','FK Crvena Zvezda','FK Shakhtar Donetsk','Galatasaray SK',
  'GNK Dinamo Zagreb','København','PAE Olympiakos SFP','Porto',
  'PSV','Qarabağ Ağdam FK','Red Bull Salzburg','Royal Antwerp','Royale Union Saint-Gilloise',
  'SK Slavia Praha','SK Sturm Graz','ŠK Slovan Bratislava','Sport Lisboa e Benfica',
  'Sporting Clube de Braga','Sporting Clube de Portugal',
].sort((a, b) => a.localeCompare(b));

export default function TeamSelector({ value, onChange, label, exclude }) {
  const [open,   setOpen]   = useState(false);
  const [query,  setQuery]  = useState('');
  const containerRef = useRef(null);

  const filtered = ALL_TEAMS.filter(t =>
    t !== exclude &&
    t.toLowerCase().includes(query.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (!containerRef.current?.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(team) {
    onChange(team);
    setOpen(false);
    setQuery('');
  }

  function clear(e) {
    e.stopPropagation();
    onChange('');
    setQuery('');
  }

  const logo = value ? getTeamLogo(value) : null;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Label */}
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">{label}</p>

      {/* Trigger */}
      <button
        type="button"
        id={`team-selector-${label.toLowerCase().replace(/\s+/g, '-')}`}
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: open ? '1px solid rgba(139,92,246,0.5)' : '1px solid rgba(255,255,255,0.1)',
          boxShadow: open ? '0 0 0 3px rgba(139,92,246,0.1)' : 'none',
        }}
      >
        {logo && (
          <img src={logo} alt={value} className="w-6 h-6 object-contain flex-shrink-0"
            onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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
          <ChevronDown size={14} className={`text-slate-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-2 rounded-xl overflow-hidden"
          style={{
            background: 'rgba(15,23,42,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            maxHeight: '260px',
          }}
        >
          {/* Search */}
          <div className="p-2 border-b border-white/5">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search teams…"
                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs text-slate-300 placeholder-slate-700 outline-none bg-white/5"
              />
            </div>
          </div>

          {/* Options */}
          <div className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {filtered.length === 0 ? (
              <p className="px-4 py-3 text-xs text-slate-600 text-center">No teams found</p>
            ) : (
              filtered.map((team) => {
                const tLogo = getTeamLogo(team);
                return (
                  <button
                    key={team}
                    type="button"
                    onClick={() => select(team)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors hover:bg-white/5"
                    style={{ color: team === value ? '#a78bfa' : '#94a3b8' }}
                  >
                    {tLogo ? (
                      <img src={tLogo} alt={team} className="w-5 h-5 object-contain flex-shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }} />
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

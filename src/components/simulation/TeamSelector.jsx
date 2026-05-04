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

// Full 194-team list from teams_df.csv
const ALL_TEAMS = [
  'Manchester United','Ipswich Town','Arsenal','Everton','Newcastle United',
  'Nottingham Forest','West Ham United','Brentford','Chelsea','Leicester City',
  'Brighton & Hove Albion','Crystal Palace','Fulham','Manchester City','Southampton',
  'Tottenham Hotspur','Aston Villa','ABournemouth','Wolverhampton Wanderers','Liverpool',
  'Athletic Club','Real Betis Balompié','RC Celta de Vigo','UD Las Palmas','CA Osasuna',
  'Valencia','Real Sociedad de Fútbol','RCD Mallorca','Real Valladolid','Villarreal',
  'Sevilla','Barcelona','Getafe','RCD Espanyol de Barcelona','Real Madrid','CD Leganés',
  'Deportivo Alavés','Club Atlético de Madrid','Rayo Vallecano de Madrid','Girona',
  'GenoaC','Parma Calcio 1913','Empoli','AC Milan','Bologna 1909','Hellas Verona',
  'Cagliari Calcio','SS Lazio','US Lecce','Juventus','Udinese Calcio',
  'Internazionale Milano','AC Monza','ACF Fiorentina','Torino','SSC Napoli',
  'AS Roma','Venezia','Como 1907','Atalanta BC','Borussia Mönchengladbach','RB Leipzig',
  'TSG 1899 Hoffenheim','SC Freiburg','Augsburg','1. FSV Mainz 05','Borussia Dortmund',
  'VfL Wolfsburg','St. Pauli 1910','1. Union Berlin','VfB Stuttgart',
  'Eintracht Frankfurt','SV Werder Bremen','VfL Bochum 1848','Holstein Kiel',
  'Bayer 04 Leverkusen','1. Heidenheim 1846','Bayern München','Le Havre AC',
  'Stade Brestois 29','Stade de Reims','AS Monaco','AJ Auxerre','Montpellier HSC',
  'Toulouse','Angers SCO','Stade Rennais 1901','Paris Saint-Germain','Olympique Lyonnais',
  'Lille OSC','AS Saint-Étienne','Racing Club de Lens','RC Strasbourg Alsace','Nantes',
  'OGC Nice','Olympique de Marseille','BSC Young Boys','Sporting Clube de Portugal',
  'AC Sparta Praha','Club Brugge KV','Celtic','Feyenoord Rotterdam','FK Crvena Zvezda',
  'PSV','Sport Lisboa e Benfica','Red Bull Salzburg','ŠK Slovan Bratislava',
  'FK Shakhtar Donetsk','GNK Dinamo Zagreb','SK Sturm Graz','Galatasaray SK',
  'Sporting Clube de Braga','København','Royal Antwerp','Porto','SK Slavia Praha',
  'PAE Olympiakos SFP','FK Bodø/Glimt','Qarabağ Ağdam FK',
  'Royale Union Saint-Gilloise','Brighton','Sunderland','Tottenham','Wolves',
  "Nott'm Forest",'Man United','Leeds','West Ham','Man City','Bournemouth',
  'Burnley','Newcastle','Mallorca','Alaves','Celta','Ath Bilbao','Espanol',
  'Betis','Ath Madrid','Osasuna','Sociedad','Bayern Munich','Ein Frankfurt',
  'Freiburg','Heidenheim','Leverkusen','Union Berlin','St Pauli','Mainz',
  "M'gladbach",'Hoffenheim','Stuttgart','Werder Bremen','Wolfsburg','Dortmund',
  'Sp Braga','Sp Lisbon','Benfica','Guimaraes','Rio Ave','Santa Clara','Porto',
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

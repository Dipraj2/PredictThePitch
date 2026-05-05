/**
 * leagueTeams.js (frontend)
 * ──────────────────────────
 * Canonical league → team-name mapping.
 * Team names MUST exactly match what teams_df.csv and the Python ML model expect.
 * This is the single source of truth; the server mirrors it at server/data/leagueTeams.js
 */

export const LEAGUES = [
  { code: 'EPL', name: 'Premier League',   flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', shortName: 'EPL' },
  { code: 'UCL', name: 'Champions League', flag: '🏆',         shortName: 'UCL' },
  { code: 'LAL', name: 'La Liga',          flag: '🇪🇸',         shortName: 'La Liga' },
  { code: 'BUN', name: 'Bundesliga',       flag: '🇩🇪',         shortName: 'Bundesliga' },
  { code: 'LIG', name: 'Ligue 1',          flag: '🇫🇷',         shortName: 'Ligue 1' },
  { code: 'SRA', name: 'Serie A',          flag: '🇮🇹',         shortName: 'Serie A' },
];

export const LEAGUE_TEAMS = {
  EPL: [
    'Arsenal','Aston Villa','ABournemouth','Brentford','Brighton & Hove Albion',
    'Chelsea','Crystal Palace','Everton','Fulham','Ipswich Town',
    'Leicester City','Liverpool','Manchester City','Manchester United','Newcastle United',
    'Nottingham Forest','Southampton','Tottenham Hotspur','West Ham United','Wolverhampton Wanderers',
  ],
  UCL: [
    'AC Sparta Praha','Arsenal','Atalanta BC','Bayer 04 Leverkusen','Bayern München',
    'Barcelona','Borussia Dortmund','BSC Young Boys','Celtic','Club Brugge KV',
    'Feyenoord Rotterdam','FK Bodø/Glimt','FK Crvena Zvezda','FK Shakhtar Donetsk',
    'Galatasaray SK','GNK Dinamo Zagreb','Internazionale Milano','Juventus',
    'København','Lille OSC','Liverpool','Manchester City','Olympique de Marseille',
    'PAE Olympiakos SFP','Paris Saint-Germain','Porto','PSV','Qarabağ Ağdam FK',
    'RB Leipzig','Real Madrid','Red Bull Salzburg','Royal Antwerp',
    'Royale Union Saint-Gilloise','SK Slavia Praha','SK Sturm Graz','ŠK Slovan Bratislava',
    'Sport Lisboa e Benfica','Sporting Clube de Braga','Sporting Clube de Portugal',
  ],
  LAL: [
    'Athletic Club','Club Atlético de Madrid','CA Osasuna','CD Leganés','Deportivo Alavés',
    'Barcelona','Getafe','Girona','RCD Espanyol de Barcelona','RCD Mallorca',
    'RC Celta de Vigo','Rayo Vallecano de Madrid','Real Betis Balompié','Real Madrid',
    'Real Sociedad de Fútbol','Real Valladolid','Sevilla','UD Las Palmas','Valencia','Villarreal',
  ],
  BUN: [
    '1. FSV Mainz 05','1. Heidenheim 1846','1. Union Berlin','Augsburg','Bayer 04 Leverkusen',
    'Bayern München','Borussia Dortmund','Borussia Mönchengladbach','Eintracht Frankfurt',
    'Holstein Kiel','RB Leipzig','SC Freiburg','St. Pauli 1910','SV Werder Bremen',
    'TSG 1899 Hoffenheim','VfB Stuttgart','VfL Bochum 1848','VfL Wolfsburg',
  ],
  LIG: [
    'AJ Auxerre','Angers SCO','AS Monaco','AS Saint-Étienne','Le Havre AC',
    'Lille OSC','Montpellier HSC','Nantes','OGC Nice','Olympique de Marseille',
    'Olympique Lyonnais','Paris Saint-Germain','Racing Club de Lens','RC Strasbourg Alsace',
    'Stade Brestois 29','Stade de Reims','Stade Rennais 1901','Toulouse',
  ],
  SRA: [
    'AC Milan','AC Monza','ACF Fiorentina','AS Roma','Atalanta BC',
    'Bologna 1909','Cagliari Calcio','Como 1907','Empoli','GenoaC',
    'Hellas Verona','Internazionale Milano','Juventus','Parma Calcio 1913','SS Lazio',
    'SSC Napoli','Torino','US Lecce','Udinese Calcio','Venezia',
  ],
};

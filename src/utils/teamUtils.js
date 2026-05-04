/**
 * teamUtils.js
 * ─────────────
 * Maps all team names (as they appear in the selector / predictions)
 * to their local logo paths under /public/logos/<League>/TeamName.png
 *
 * Covers 194 teams across 25 European leagues.
 */

/** @type {Record<string, { league: string; file: string }>} */
const TEAM_META = {
  // ── England – Premier League ───────────────────────────────────────────────
  'Arsenal':                       { league: 'England - Premier League',        file: 'Arsenal FC' },
  'Aston Villa':                   { league: 'England - Premier League',        file: 'Aston Villa' },
  'Bournemouth':                   { league: 'England - Premier League',        file: 'AFC Bournemouth' },
  'ABournemouth':                  { league: 'England - Premier League',        file: 'AFC Bournemouth' },
  'Brentford':                     { league: 'England - Premier League',        file: 'Brentford FC' },
  'Brighton & Hove Albion':        { league: 'England - Premier League',        file: 'Brighton & Hove Albion' },
  'Brighton':                      { league: 'England - Premier League',        file: 'Brighton & Hove Albion' },
  'Burnley':                       { league: 'England - Premier League',        file: 'Burnley FC' },
  'Chelsea':                       { league: 'England - Premier League',        file: 'Chelsea FC' },
  'Crystal Palace':                { league: 'England - Premier League',        file: 'Crystal Palace' },
  'Everton':                       { league: 'England - Premier League',        file: 'Everton FC' },
  'Fulham':                        { league: 'England - Premier League',        file: 'Fulham FC' },
  'Leeds':                         { league: 'England - Premier League',        file: 'Leeds United' },
  'Liverpool':                     { league: 'England - Premier League',        file: 'Liverpool FC' },
  'Man City':                      { league: 'England - Premier League',        file: 'Manchester City' },
  'Man United':                    { league: 'England - Premier League',        file: 'Manchester United' },
  'Manchester City':               { league: 'England - Premier League',        file: 'Manchester City' },
  'Manchester United':             { league: 'England - Premier League',        file: 'Manchester United' },
  'Newcastle':                     { league: 'England - Premier League',        file: 'Newcastle United' },
  'Newcastle United':              { league: 'England - Premier League',        file: 'Newcastle United' },
  "Nott'm Forest":                 { league: 'England - Premier League',        file: 'Nottingham Forest' },
  'Nottingham Forest':             { league: 'England - Premier League',        file: 'Nottingham Forest' },
  'Sunderland':                    { league: 'England - Premier League',        file: 'Sunderland AFC' },
  'Tottenham':                     { league: 'England - Premier League',        file: 'Tottenham Hotspur' },
  'Tottenham Hotspur':             { league: 'England - Premier League',        file: 'Tottenham Hotspur' },
  'West Ham':                      { league: 'England - Premier League',        file: 'West Ham United' },
  'West Ham United':               { league: 'England - Premier League',        file: 'West Ham United' },
  'Wolves':                        { league: 'England - Premier League',        file: 'Wolverhampton Wanderers' },
  'Wolverhampton Wanderers':       { league: 'England - Premier League',        file: 'Wolverhampton Wanderers' },

  // ── Spain – LaLiga ─────────────────────────────────────────────────────────
  'Athletic Club':                 { league: 'Spain - LaLiga',                  file: 'Athletic Bilbao' },
  'Ath Bilbao':                    { league: 'Spain - LaLiga',                  file: 'Athletic Bilbao' },
  'Ath Madrid':                    { league: 'Spain - LaLiga',                  file: 'Atlético de Madrid' },
  'Club Atlético de Madrid':       { league: 'Spain - LaLiga',                  file: 'Atlético de Madrid' },
  'Barcelona':                     { league: 'Spain - LaLiga',                  file: 'FC Barcelona' },
  'CA Osasuna':                    { league: 'Spain - LaLiga',                  file: 'CA Osasuna' },
  'Osasuna':                       { league: 'Spain - LaLiga',                  file: 'CA Osasuna' },
  'RC Celta de Vigo':              { league: 'Spain - LaLiga',                  file: 'Celta de Vigo' },
  'Celta':                         { league: 'Spain - LaLiga',                  file: 'Celta de Vigo' },
  'Deportivo Alavés':              { league: 'Spain - LaLiga',                  file: 'Deportivo Alavés' },
  'Alaves':                        { league: 'Spain - LaLiga',                  file: 'Deportivo Alavés' },
  'Getafe':                        { league: 'Spain - LaLiga',                  file: 'Getafe CF' },
  'Girona':                        { league: 'Spain - LaLiga',                  file: 'Girona FC' },
  'Mallorca':                      { league: 'Spain - LaLiga',                  file: 'RCD Mallorca' },
  'RCD Mallorca':                  { league: 'Spain - LaLiga',                  file: 'RCD Mallorca' },
  'Rayo Vallecano de Madrid':      { league: 'Spain - LaLiga',                  file: 'Rayo Vallecano' },
  'Rayo Vallecano':                { league: 'Spain - LaLiga',                  file: 'Rayo Vallecano' },
  'Real Betis Balompié':           { league: 'Spain - LaLiga',                  file: 'Real Betis Balompié' },
  'Betis':                         { league: 'Spain - LaLiga',                  file: 'Real Betis Balompié' },
  'Real Madrid':                   { league: 'Spain - LaLiga',                  file: 'Real Madrid' },
  'Real Sociedad de Fútbol':       { league: 'Spain - LaLiga',                  file: 'Real Sociedad' },
  'Sociedad':                      { league: 'Spain - LaLiga',                  file: 'Real Sociedad' },
  'Real Valladolid':               { league: 'Spain - LaLiga',                  file: 'Real Valladolid' },
  'RCD Espanyol de Barcelona':     { league: 'Spain - LaLiga',                  file: 'RCD Espanyol Barcelona' },
  'Espanol':                       { league: 'Spain - LaLiga',                  file: 'RCD Espanyol Barcelona' },
  'Sevilla':                       { league: 'Spain - LaLiga',                  file: 'Sevilla FC' },
  'Valencia':                      { league: 'Spain - LaLiga',                  file: 'Valencia CF' },
  'Villarreal':                    { league: 'Spain - LaLiga',                  file: 'Villarreal CF' },

  // ── Germany – Bundesliga ───────────────────────────────────────────────────
  'Augsburg':                      { league: 'Germany - Bundesliga',            file: 'FC Augsburg' },
  'Bayer 04 Leverkusen':           { league: 'Germany - Bundesliga',            file: 'Bayer 04 Leverkusen' },
  'Leverkusen':                    { league: 'Germany - Bundesliga',            file: 'Bayer 04 Leverkusen' },
  'Bayern München':                { league: 'Germany - Bundesliga',            file: 'Bayern Munich' },
  'Bayern Munich':                 { league: 'Germany - Bundesliga',            file: 'Bayern Munich' },
  'Borussia Dortmund':             { league: 'Germany - Bundesliga',            file: 'Borussia Dortmund' },
  'Dortmund':                      { league: 'Germany - Bundesliga',            file: 'Borussia Dortmund' },
  'Borussia Mönchengladbach':      { league: 'Germany - Bundesliga',            file: 'Borussia Mönchengladbach' },
  "M'gladbach":                    { league: 'Germany - Bundesliga',            file: 'Borussia Mönchengladbach' },
  'Eintracht Frankfurt':           { league: 'Germany - Bundesliga',            file: 'Eintracht Frankfurt' },
  'Ein Frankfurt':                 { league: 'Germany - Bundesliga',            file: 'Eintracht Frankfurt' },
  'SC Freiburg':                   { league: 'Germany - Bundesliga',            file: 'SC Freiburg' },
  'Freiburg':                      { league: 'Germany - Bundesliga',            file: 'SC Freiburg' },
  '1. Heidenheim 1846':            { league: 'Germany - Bundesliga',            file: '1.FC Heidenheim 1846' },
  'Heidenheim':                    { league: 'Germany - Bundesliga',            file: '1.FC Heidenheim 1846' },
  'TSG 1899 Hoffenheim':           { league: 'Germany - Bundesliga',            file: 'TSG 1899 Hoffenheim' },
  'Hoffenheim':                    { league: 'Germany - Bundesliga',            file: 'TSG 1899 Hoffenheim' },
  'Holstein Kiel':                 { league: 'Germany - Bundesliga',            file: 'Holstein Kiel' },
  '1. FSV Mainz 05':               { league: 'Germany - Bundesliga',            file: '1.FSV Mainz 05' },
  'Mainz':                         { league: 'Germany - Bundesliga',            file: '1.FSV Mainz 05' },
  'RB Leipzig':                    { league: 'Germany - Bundesliga',            file: 'RB Leipzig' },
  'St. Pauli 1910':                { league: 'Germany - Bundesliga',            file: 'FC St. Pauli' },
  'St Pauli':                      { league: 'Germany - Bundesliga',            file: 'FC St. Pauli' },
  'VfB Stuttgart':                 { league: 'Germany - Bundesliga',            file: 'VfB Stuttgart' },
  'Stuttgart':                     { league: 'Germany - Bundesliga',            file: 'VfB Stuttgart' },
  '1. Union Berlin':               { league: 'Germany - Bundesliga',            file: '1.FC Union Berlin' },
  'Union Berlin':                  { league: 'Germany - Bundesliga',            file: '1.FC Union Berlin' },
  'VfL Bochum 1848':               { league: 'Germany - Bundesliga',            file: 'VfL Bochum 1848' },
  'VfL Wolfsburg':                 { league: 'Germany - Bundesliga',            file: 'VfL Wolfsburg' },
  'Wolfsburg':                     { league: 'Germany - Bundesliga',            file: 'VfL Wolfsburg' },
  'SV Werder Bremen':              { league: 'Germany - Bundesliga',            file: 'SV Werder Bremen' },
  'Werder Bremen':                 { league: 'Germany - Bundesliga',            file: 'SV Werder Bremen' },

  // ── France – Ligue 1 ──────────────────────────────────────────────────────
  'AJ Auxerre':                    { league: 'France - Ligue 1',                file: 'AJ Auxerre' },
  'Angers SCO':                    { league: 'France - Ligue 1',                file: 'Angers SCO' },
  'AS Monaco':                     { league: 'France - Ligue 1',                file: 'AS Monaco' },
  'AS Saint-Étienne':              { league: 'France - Ligue 1',                file: 'AS Saint-Etienne' },
  'Le Havre AC':                   { league: 'France - Ligue 1',                file: 'Le Havre AC' },
  'Lille OSC':                     { league: 'France - Ligue 1',                file: 'LOSC Lille' },
  'Montpellier HSC':               { league: 'France - Ligue 1',                file: 'Montpellier HSC' },
  'Nantes':                        { league: 'France - Ligue 1',                file: 'FC Nantes' },
  'OGC Nice':                      { league: 'France - Ligue 1',                file: 'OGC Nice' },
  'Olympique de Marseille':        { league: 'France - Ligue 1',                file: 'Olympique Marseille' },
  'Olympique Lyonnais':            { league: 'France - Ligue 1',                file: 'Olympique Lyon' },
  'Paris Saint-Germain':           { league: 'France - Ligue 1',                file: 'Paris Saint-Germain' },
  'Racing Club de Lens':           { league: 'France - Ligue 1',                file: 'RC Lens' },
  'RC Strasbourg Alsace':          { league: 'France - Ligue 1',                file: 'RC Strasbourg Alsace' },
  'Stade Brestois 29':             { league: 'France - Ligue 1',                file: 'Stade Brestois 29' },
  'Stade de Reims':                { league: 'France - Ligue 1',                file: 'Stade de Reims' },
  'Stade Rennais 1901':            { league: 'France - Ligue 1',                file: 'Stade Rennais FC' },
  'Toulouse':                      { league: 'France - Ligue 1',                file: 'FC Toulouse' },

  // ── Italy – Serie A ────────────────────────────────────────────────────────
  'AC Milan':                      { league: 'Italy - Serie A',                 file: 'AC Milan' },
  'ACF Fiorentina':                { league: 'Italy - Serie A',                 file: 'ACF Fiorentina' },
  'AS Roma':                       { league: 'Italy - Serie A',                 file: 'AS Roma' },
  'Atalanta BC':                   { league: 'Italy - Serie A',                 file: 'Atalanta BC' },
  'Bologna 1909':                  { league: 'Italy - Serie A',                 file: 'Bologna FC 1909' },
  'Cagliari Calcio':               { league: 'Italy - Serie A',                 file: 'Cagliari Calcio' },
  'Como 1907':                     { league: 'Italy - Serie A',                 file: 'Como 1907' },
  'GenoaC':                        { league: 'Italy - Serie A',                 file: 'Genoa CFC' },
  'Hellas Verona':                 { league: 'Italy - Serie A',                 file: 'Hellas Verona' },
  'Internazionale Milano':         { league: 'Italy - Serie A',                 file: 'Inter Milan' },
  'Juventus':                      { league: 'Italy - Serie A',                 file: 'Juventus FC' },
  'Parma Calcio 1913':             { league: 'Italy - Serie A',                 file: 'Parma Calcio 1913' },
  'SS Lazio':                      { league: 'Italy - Serie A',                 file: 'SS Lazio' },
  'SSC Napoli':                    { league: 'Italy - Serie A',                 file: 'SSC Napoli' },
  'Torino':                        { league: 'Italy - Serie A',                 file: 'Torino FC' },
  'Udinese Calcio':                { league: 'Italy - Serie A',                 file: 'Udinese Calcio' },
  'US Lecce':                      { league: 'Italy - Serie A',                 file: 'US Lecce' },

  // ── Portugal – Liga Portugal ───────────────────────────────────────────────
  'Sporting Clube de Portugal':    { league: 'Portugal - Liga Portugal',        file: 'Sporting CP' },
  'Sp Lisbon':                     { league: 'Portugal - Liga Portugal',        file: 'Sporting CP' },
  'Sport Lisboa e Benfica':        { league: 'Portugal - Liga Portugal',        file: 'SL Benfica' },
  'Benfica':                       { league: 'Portugal - Liga Portugal',        file: 'SL Benfica' },
  'Porto':                         { league: 'Portugal - Liga Portugal',        file: 'FC Porto' },
  'Sporting Clube de Braga':       { league: 'Portugal - Liga Portugal',        file: 'SC Braga' },
  'Sp Braga':                      { league: 'Portugal - Liga Portugal',        file: 'SC Braga' },

  // ── Netherlands – Eredivisie ───────────────────────────────────────────────
  'Feyenoord Rotterdam':           { league: 'Netherlands - Eredivisie',        file: 'Feyenoord Rotterdam' },
  'PSV':                           { league: 'Netherlands - Eredivisie',        file: 'PSV Eindhoven' },

  // ── Scotland – Scottish Premiership ───────────────────────────────────────
  'Celtic':                        { league: 'Scotland - Scottish Premiership', file: 'Celtic FC' },

  // ── Belgium – Jupiler Pro League ──────────────────────────────────────────
  'Club Brugge KV':                { league: 'Belgium - Jupiler Pro League',    file: 'Club Brugge KV' },
  'Royal Antwerp':                 { league: 'Belgium - Jupiler Pro League',    file: 'Royal Antwerp FC' },
  'Royale Union Saint-Gilloise':   { league: 'Belgium - Jupiler Pro League',    file: 'Union Saint-Gilloise' },

  // ── Austria – Bundesliga ──────────────────────────────────────────────────
  'Red Bull Salzburg':             { league: 'Austria - Bundesliga',            file: 'Red Bull Salzburg' },
  'SK Sturm Graz':                 { league: 'Austria - Bundesliga',            file: 'SK Sturm Graz' },

  // ── Czech Republic ────────────────────────────────────────────────────────
  'AC Sparta Praha':               { league: 'Czech Republic - Chance Liga',    file: 'AC Sparta Prague' },
  'SK Slavia Praha':               { league: 'Czech Republic - Chance Liga',    file: 'SK Slavia Prague' },

  // ── Denmark – Superliga ───────────────────────────────────────────────────
  'København':                     { league: 'Denmark - Superliga',             file: 'FC Copenhagen' },
  'FK Bodø/Glimt':                 { league: 'Norway - Eliteserien',            file: 'FK Bodo-Glimt' },

  // ── Serbia ────────────────────────────────────────────────────────────────
  'FK Crvena Zvezda':              { league: 'Serbia - Super liga Srbije',      file: 'FK Crvena Zvezda' },

  // ── Ukraine ───────────────────────────────────────────────────────────────
  'FK Shakhtar Donetsk':           { league: 'Ukraine - Premier Liga',          file: 'Shakhtar Donetsk' },

  // ── Croatia ───────────────────────────────────────────────────────────────
  'GNK Dinamo Zagreb':             { league: 'Croatia - SuperSport HNL',        file: 'GNK Dinamo Zagreb' },

  // ── Switzerland ───────────────────────────────────────────────────────────
  'BSC Young Boys':                { league: 'Switzerland - Super League',      file: 'BSC Young Boys' },
  'ŠK Slovan Bratislava':          { league: 'Switzerland - Super League',      file: 'Slovan Bratislava' },

  // ── Turkey – Süper Lig ─────────────────────────────────────────────────────
  'Galatasaray SK':                { league: 'Türkiye - Süper Lig',             file: 'Galatasaray SK' },

  // ── Greece ────────────────────────────────────────────────────────────────
  'PAE Olympiakos SFP':            { league: 'Greece - Super League 1',         file: 'Olympiakos FC' },
};

/**
 * Returns the public path to a team's logo PNG.
 * Returns null if the team is not in the mapping (triggers the fallback initials badge).
 *
 * @param {string} teamName - Full or short team name
 * @returns {string|null}
 */
export function getTeamLogo(teamName) {
  const meta = TEAM_META[teamName];
  if (!meta) return null;
  return `/logos/${meta.league}/${meta.file}.png`;
}

/**
 * Returns a short display name for use in compact contexts.
 *
 * @param {string} teamName
 * @returns {string}
 */
const SHORT_NAMES = {
  'Paris Saint-Germain':        'PSG',
  'Liverpool':                  'Liverpool',
  'Real Madrid':                'Real Madrid',
  'Bayern München':             'Bayern',
  'Bayern Munich':              'Bayern',
  'Barcelona':                  'Barcelona',
  'Club Atlético de Madrid':    'Atlético',
  'Sporting Clube de Portugal': 'Sporting CP',
  'Arsenal':                    'Arsenal',
  'Manchester City':            'Man City',
  'Manchester United':          'Man United',
  'Internazionale Milano':      'Inter Milan',
  'Borussia Dortmund':          'Dortmund',
  'Bayer 04 Leverkusen':        'Leverkusen',
  'Wolverhampton Wanderers':    'Wolves',
  'Tottenham Hotspur':          'Spurs',
  'Newcastle United':           'Newcastle',
  'Nottingham Forest':          'Forest',
  'West Ham United':            'West Ham',
};

export function getShortName(teamName) {
  return SHORT_NAMES[teamName] ?? teamName;
}

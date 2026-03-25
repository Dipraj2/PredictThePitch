/**
 * teamUtils.js
 * ─────────────
 * Maps official team names (as they appear in predictions.json) to
 * their local logo paths under /public/logos/<League>/TeamName.png
 *
 * To add a new team: add an entry to TEAM_META below.
 */

/** @type {Record<string, { league: string; file: string }>} */
const TEAM_META = {
  "Paris Saint-Germain":          { league: "France - Ligue 1",           file: "Paris Saint-Germain" },
  "Liverpool":                    { league: "England - Premier League",   file: "Liverpool FC" },
  "Real Madrid":                  { league: "Spain - LaLiga",             file: "Real Madrid" },
  "Bayern Munich":                { league: "Germany - Bundesliga",       file: "Bayern Munich" },
  "Barcelona":                    { league: "Spain - LaLiga",             file: "FC Barcelona" },
  "Club Atlético de Madrid":      { league: "Spain - LaLiga",             file: "Atlético de Madrid" },
  "Sporting Clube de Portugal":   { league: "Portugal - Liga Portugal",   file: "Sporting CP" },
  "Arsenal":                      { league: "England - Premier League",   file: "Arsenal FC" },
};

/**
 * Returns the public path to a team's logo PNG.
 * Returns null if the team is not in the mapping (triggers the <img> fallback).
 *
 * @param {string} teamName - Full team name, e.g. "Real Madrid CF"
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
export function getShortName(teamName) {
  const SHORT_NAMES = {
    "Paris Saint-Germain":        "Paris SG",
    "Liverpool":                  "Liverpool",
    "Real Madrid":                "Real Madrid",
    "Bayern Munich":              "Bayern Munich",
    "Barcelona":                  "Barcelona",
    "Club Atlético de Madrid":    "Atlético Madrid",
    "Sporting Clube de Portugal": "Sporting CP",
    "Arsenal":                    "Arsenal",
  };
  return SHORT_NAMES[teamName] ?? teamName;
}

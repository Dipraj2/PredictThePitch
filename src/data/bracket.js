/**
 * bracket.js
 * -----------
 * Hardcoded match data for the 2025-26 UCL bracket.
 * Replace prediction values with real Firebase/API data later.
 */

export const BRACKET_DATA = {
  leftQF: [
    {
      id: "qf-l1",
      round: "Quarter-Final",
      team1: { name: "Paris SG",  flag: "\uD83C\uDDEB\uD83C\uDDF7", abbr: "PSG", color: "#003087" },
      team2: { name: "Liverpool",  flag: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F", abbr: "LIV", color: "#c8102e" },
      prediction: {
        team1WinPct: 42,
        team2WinPct: 58,
        drawPct: 0,
        team1XG: 1.62,
        team2XG: 2.11,
        winner: "Liverpool",
        winnerAbbr: "LIV",
        confidence: 72,
        keyInsight: "Liverpool's high press is expected to exploit PSG's defensive transitions.",
      },
    },
    {
      id: "qf-l2",
      round: "Quarter-Final",
      team1: { name: "Real Madrid",    flag: "\uD83C\uDDEA\uD83C\uDDF8", abbr: "RMA", color: "#fabe00" },
      team2: { name: "Bayern Munich",  flag: "\uD83C\uDDE9\uD83C\uDDEA", abbr: "BAY", color: "#dc052d" },
      prediction: {
        team1WinPct: 55,
        team2WinPct: 45,
        drawPct: 0,
        team1XG: 1.94,
        team2XG: 1.58,
        winner: "Real Madrid",
        winnerAbbr: "RMA",
        confidence: 64,
        keyInsight: "Real Madrid's UCL pedigree and home advantage tips the model in their favor.",
      },
    },
  ],

  leftSF: [
    {
      id: "sf-l1",
      round: "Semi-Final",
      team1: { name: "TBD", flag: "\u2753", abbr: "TBD" },
      team2: { name: "TBD", flag: "\u2753", abbr: "TBD" },
      prediction: null,
    },
  ],

  rightQF: [
    {
      id: "qf-r1",
      round: "Quarter-Final",
      team1: { name: "Barcelona",       flag: "\uD83C\uDDEA\uD83C\uDDF8", abbr: "BAR", color: "#a50044" },
      team2: { name: "Atletico Madrid", flag: "\uD83C\uDDEA\uD83C\uDDF8", abbr: "ATM", color: "#ce3524" },
      prediction: {
        team1WinPct: 61,
        team2WinPct: 39,
        drawPct: 0,
        team1XG: 2.28,
        team2XG: 1.31,
        winner: "Barcelona",
        winnerAbbr: "BAR",
        confidence: 78,
        keyInsight: "Barcelona's possession dominance and attacking depth overwhelm Atletico's low block.",
      },
    },
    {
      id: "qf-r2",
      round: "Quarter-Final",
      team1: { name: "Sporting CP", flag: "\uD83C\uDDF5\uD83C\uDDF9", abbr: "SCP", color: "#006600" },
      team2: { name: "Arsenal",     flag: "\uD83C\uDFF4\uDB40\uDC67\uDB40\uDC62\uDB40\uDC65\uDB40\uDC6E\uDB40\uDC67\uDB40\uDC7F", abbr: "ARS", color: "#ef0107" },
      prediction: {
        team1WinPct: 33,
        team2WinPct: 67,
        drawPct: 0,
        team1XG: 1.18,
        team2XG: 2.34,
        winner: "Arsenal",
        winnerAbbr: "ARS",
        confidence: 81,
        keyInsight: "Arsenal's pressing intensity and clinical finishing give them a decisive edge.",
      },
    },
  ],

  rightSF: [
    {
      id: "sf-r1",
      round: "Semi-Final",
      team1: { name: "TBD", flag: "\u2753", abbr: "TBD" },
      team2: { name: "TBD", flag: "\u2753", abbr: "TBD" },
      prediction: null,
    },
  ],

  final: {
    id: "final",
    round: "Final",
    team1: { name: "TBD", flag: "\u2753", abbr: "TBD" },
    team2: { name: "TBD", flag: "\u2753", abbr: "TBD" },
    prediction: null,
  },
};

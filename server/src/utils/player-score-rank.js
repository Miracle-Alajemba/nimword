export function rankPlayersByScore(players = []) {
  return [...players].sort((a, b) => b.score - a.score).map((p, i) => ({ ...p, rank: i + 1 }));
}

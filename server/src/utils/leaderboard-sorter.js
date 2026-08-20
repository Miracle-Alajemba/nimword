export function sortLeaderboard(players = []) {
  return [...players].sort((a, b) => b.score - a.score || a.time - b.time);
}

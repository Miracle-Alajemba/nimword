export function calculatePlayerWinRate(wins = 0, totalGames = 0) {
  if (totalGames <= 0) return 0;
  return Math.round((wins / totalGames) * 100);
}

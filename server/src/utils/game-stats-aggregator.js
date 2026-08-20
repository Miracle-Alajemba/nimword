export function aggregatePlayerStats(games = []) {
  const totalGames = games.length;
  const totalScore = games.reduce((sum, g) => sum + (g.score || 0), 0);
  const avgScore = totalGames > 0 ? Math.round(totalScore / totalGames) : 0;
  return { totalGames, totalScore, avgScore };
}

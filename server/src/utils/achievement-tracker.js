export function evaluateAchievements(stats = {}) {
  const unlocked = [];
  if (stats.wordsFound >= 100) unlocked.push("VOCABULIST");
  if (stats.wins >= 10) unlocked.push("CHAMPION");
  if (stats.longestWord >= 8) unlocked.push("LEXICON_MASTER");
  return unlocked;
}

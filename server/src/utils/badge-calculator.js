/**
 * Player achievement badge calculation logic based on game statistics.
 */

export const BADGE_DEFINITIONS = {
  WORD_SMITH: { id: "WORD_SMITH", name: "Word Smith", icon: "🧠", minScore: 50 },
  SPEED_DEMON: { id: "SPEED_DEMON", name: "Speed Demon", icon: "⚡", minWords: 10 },
  CELO_CHAMP: { id: "CELO_CHAMP", name: "Celo Champ", icon: "🏆", minWins: 5 },
  DAILY_STREAK: { id: "DAILY_STREAK", name: "Daily Streak", icon: "🔥", minStreak: 3 },
};

/**
 * Calculate unlocked badges for a player based on stats.
 * @param {{ totalScore: number, totalWords: number, wins: number, streak: number }} stats
 * @returns {Array<{ id: string, name: string, icon: string }>}
 */
export function calculateUnlockedBadges(stats = {}) {
  const { totalScore = 0, totalWords = 0, wins = 0, streak = 0 } = stats;
  const unlocked = [];

  if (totalScore >= BADGE_DEFINITIONS.WORD_SMITH.minScore) {
    unlocked.push(BADGE_DEFINITIONS.WORD_SMITH);
  }
  if (totalWords >= BADGE_DEFINITIONS.SPEED_DEMON.minWords) {
    unlocked.push(BADGE_DEFINITIONS.SPEED_DEMON);
  }
  if (wins >= BADGE_DEFINITIONS.CELO_CHAMP.minWins) {
    unlocked.push(BADGE_DEFINITIONS.CELO_CHAMP);
  }
  if (streak >= BADGE_DEFINITIONS.DAILY_STREAK.minStreak) {
    unlocked.push(BADGE_DEFINITIONS.DAILY_STREAK);
  }

  return unlocked;
}

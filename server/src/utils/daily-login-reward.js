export function getDailyRewardAmount(dayStreak = 1) {
  const rewards = [10, 25, 50, 75, 100, 150, 300];
  const index = Math.min(Math.max(1, dayStreak) - 1, 6);
  return rewards[index];
}

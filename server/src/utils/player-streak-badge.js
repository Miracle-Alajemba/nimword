export function formatStreakBadge(streakDays = 1) {
  if (streakDays >= 7) return `🔥 ${streakDays} Days`;
  return `⚡ ${streakDays} Day`;
}

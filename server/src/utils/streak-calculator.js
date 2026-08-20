export function calculateStreak(lastPlayDate, currentStreak = 0) {
  if (!lastPlayDate) return 1;
  const now = new Date();
  const last = new Date(lastPlayDate);
  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
  if (diffDays === 1) return currentStreak + 1;
  if (diffDays === 0) return currentStreak;
  return 1;
}

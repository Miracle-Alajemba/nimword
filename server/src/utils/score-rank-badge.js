export function getScoreBadge(score = 0) {
  if (score >= 500) return "🥇 Legend";
  if (score >= 250) return "🥈 Master";
  if (score >= 100) return "🥉 Expert";
  return "🌱 Novice";
}

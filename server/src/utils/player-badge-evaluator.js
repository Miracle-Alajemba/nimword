export function checkBadgeUnlock(badgeId, stats = {}) {
  if (badgeId === "SPEED_DEMON" && stats.avgTimeSeconds <= 1.5) return true;
  if (badgeId === "CELO_WHALE" && stats.totalCeloEarned >= 5.0) return true;
  return false;
}

export function checkBadgeUnlock(badgeId, stats = {}) {
  if (badgeId === "SPEED_DEMON" && stats.avgTimeSeconds <= 1.5) return true;
  if (badgeId === "NIM_WHALE" && stats.totalNimiqEarned >= 5.0) return true;
  return false;
}

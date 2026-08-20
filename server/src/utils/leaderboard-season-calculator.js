export function getDaysUntilSeasonEnd(seasonEndDate) {
  if (!seasonEndDate) return 0;
  const diffMs = new Date(seasonEndDate).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

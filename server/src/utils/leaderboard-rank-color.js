export function getRankBadgeColor(rank = 1) {
  if (rank === 1) return "#fbbf24";
  if (rank === 2) return "#94a3b8";
  if (rank === 3) return "#b45309";
  return "#64748b";
}

/**
 * Leaderboard Rank Tier Color Utility
 */

/**
 * Returns Tailwind CSS color classes for leaderboard ranks (1st, 2nd, 3rd, Top 10, etc.).
 * @param {number} rank
 * @returns {{ text: string, bg: string, border: string }}
 */
export function getRankTierColors(rank) {
  const r = Number(rank);
  if (r === 1) {
    return {
      text: "text-amber-300",
      bg: "bg-amber-500/20",
      border: "border-amber-500/50",
    };
  }
  if (r === 2) {
    return {
      text: "text-slate-200",
      bg: "bg-slate-400/20",
      border: "border-slate-400/50",
    };
  }
  if (r === 3) {
    return {
      text: "text-amber-600",
      bg: "bg-amber-700/20",
      border: "border-amber-700/50",
    };
  }
  if (r <= 10) {
    return {
      text: "text-cyan-300",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/30",
    };
  }
  return {
    text: "text-slate-400",
    bg: "bg-slate-800/30",
    border: "border-slate-700/30",
  };
}

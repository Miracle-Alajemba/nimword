/**
 * Score and Number Compact Formatter Utility
 */

/**
 * Formats raw numeric score into compact notation (e.g. 1250 -> "1.3k").
 * @param {number} score
 * @returns {string}
 */
export function formatScoreCompact(score = 0) {
  const num = Number(score) || 0;
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
  }
  return num.toString();
}

/**
 * Adds ordinal suffix to rank number (e.g. 1 -> "1st", 2 -> "2nd").
 * @param {number} rank
 * @returns {string}
 */
export function formatRankOrdinal(rank) {
  const n = Number(rank);
  if (!n || n <= 0) return "-";
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Number and score formatting utilities for the game UI.
 */

/**
 * Format a large number with compact notation (e.g., 1.2K, 3.5M).
 * @param {number} num
 * @param {number} [decimals=1]
 * @returns {string}
 */
export function compactNumber(num, decimals = 1) {
  const n = Number(num) || 0;
  if (Math.abs(n) < 1000) return String(n);
  const units = ["K", "M", "B", "T"];
  let tier = Math.floor(Math.log10(Math.abs(n)) / 3) - 1;
  tier = Math.min(tier, units.length - 1);
  const scale = Math.pow(10, (tier + 1) * 3);
  const scaled = n / scale;
  return `${scaled.toFixed(decimals)}${units[tier]}`;
}

/**
 * Format a CELO wei value to a display string.
 * @param {string | number | bigint} wei
 * @param {number} [decimals=4]
 * @returns {string}
 */
export function formatCeloFromWei(wei, decimals = 4) {
  const value = Number(BigInt(wei || 0)) / 1e18;
  return value.toFixed(decimals);
}

/**
 * Format a score with + prefix if positive.
 * @param {number} score
 * @returns {string}
 */
export function formatScoreChange(score) {
  const n = Number(score) || 0;
  if (n > 0) return `+${n}`;
  return String(n);
}

/**
 * Format a percentage value.
 * @param {number} value
 * @param {number} total
 * @param {number} [decimals=0]
 * @returns {string}
 */
export function formatPercent(value, total, decimals = 0) {
  if (!total || total === 0) return "0%";
  return `${((value / total) * 100).toFixed(decimals)}%`;
}

/**
 * Ordinal suffix for rank display (1st, 2nd, 3rd, etc.).
 * @param {number} n
 * @returns {string}
 */
export function ordinal(n) {
  const num = Number(n) || 0;
  const s = ["th", "st", "nd", "rd"];
  const v = num % 100;
  return `${num}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

/**
 * Color and theme utility functions.
 */

/**
 * Generate a deterministic HSL color from a string hash.
 * @param {string} str
 * @param {number} [saturation=65]
 * @param {number} [lightness=55]
 * @returns {string}
 */
export function stringToColor(str, saturation = 65, lightness = 55) {
  let hash = 0;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    hash = s.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Lighten or darken a hex color.
 * @param {string} hex - 6-digit hex color (e.g., "#ff7a18")
 * @param {number} percent - Positive to lighten, negative to darken (-100 to 100)
 * @returns {string}
 */
export function adjustColor(hex, percent) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  const amt = Math.round(2.55 * percent);

  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/**
 * Get a rank-based color for leaderboard positions.
 * @param {number} rank - 1-indexed rank.
 * @returns {string}
 */
export function rankColor(rank) {
  if (rank === 1) return "#ffd700"; // Gold
  if (rank === 2) return "#c0c0c0"; // Silver
  if (rank === 3) return "#cd7f32"; // Bronze
  return "rgba(255, 255, 255, 0.5)";
}

/**
 * Get a score-based color for word scoring tiers.
 * @param {number} score
 * @returns {string}
 */
export function scoreColor(score) {
  if (score >= 12) return "#63f4ca"; // Epic
  if (score >= 8) return "#ffad33"; // Great
  if (score >= 5) return "#567fff"; // Good
  return "rgba(255, 255, 255, 0.6)"; // Standard
}

/**
 * Generate a CSS gradient string from two colors.
 * @param {string} from
 * @param {string} to
 * @param {number} [angle=135]
 * @returns {string}
 */
export function gradient(from, to, angle = 135) {
  return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
}

/**
 * Client Math Utilities Module
 */

/**
 * Clamps a numeric value within a minimum and maximum range.
 * @param {number} val
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clampValue(val, min, max) {
  return Math.max(min, Math.min(max, Number(val) || 0));
}

/**
 * Returns a random integer between min and max inclusive.
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function getRandomInt(min, max) {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil + 1)) + minCeil;
}

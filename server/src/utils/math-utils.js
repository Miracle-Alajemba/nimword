/**
 * Mathematical utilities for score calculations, win rates, and prize fractions in WordPot.
 */

/**
 * Calculate player accuracy percentage (valid words / total submitted words).
 * @param {number} validCount
 * @param {number} totalSubmitted
 * @returns {number} Percentage formatted to 1 decimal place (0 to 100)
 */
export function calculateAccuracyPercentage(validCount, totalSubmitted) {
  if (
    typeof validCount !== "number" ||
    typeof totalSubmitted !== "number" ||
    totalSubmitted <= 0 ||
    validCount < 0
  ) {
    return 0;
  }
  const pct = (validCount / totalSubmitted) * 100;
  return Number(Math.min(100, Math.max(0, pct)).toFixed(1));
}

/**
 * Safely format floating point token amounts to 4 decimal places without floating precision noise.
 * @param {number} amount
 * @returns {number}
 */
export function formatTokenAmount(amount) {
  if (typeof amount !== "number" || isNaN(amount) || amount <= 0) return 0;
  return Number(amount.toFixed(4));
}

/**
 * Calculate average points scored per valid word.
 * @param {number} totalScore
 * @param {number} validWordsCount
 * @returns {number} Average score to 2 decimal places
 */
export function calculateAverageWordScore(totalScore, validWordsCount) {
  if (
    typeof totalScore !== "number" ||
    typeof validWordsCount !== "number" ||
    validWordsCount <= 0 ||
    totalScore < 0
  ) {
    return 0;
  }
  return Number((totalScore / validWordsCount).toFixed(2));
}

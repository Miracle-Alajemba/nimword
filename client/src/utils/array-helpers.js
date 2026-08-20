/**
 * Client Array Utility Module
 */

/**
 * Shuffles an array in place using Fisher-Yates algorithm.
 * @template T
 * @param {Array<T>} arr
 * @returns {Array<T>}
 */
export function shuffleArray(arr) {
  if (!Array.isArray(arr)) return [];
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Picks random elements from an array.
 * @template T
 * @param {Array<T>} arr
 * @param {number} [count=1]
 * @returns {Array<T>}
 */
export function getRandomElements(arr, count = 1) {
  if (!Array.isArray(arr) || arr.length === 0) return [];
  const shuffled = shuffleArray(arr);
  return shuffled.slice(0, count);
}

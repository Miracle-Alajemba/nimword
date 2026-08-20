/**
 * Input validation utilities for the game client.
 */

/**
 * Validate that a word only contains alphabetic characters.
 * @param {string} word
 * @returns {boolean}
 */
export function isAlphaOnly(word) {
  return /^[a-zA-Z]+$/.test(String(word || ""));
}

/**
 * Validate word length is within game bounds.
 * @param {string} word
 * @param {number} [minLength=3]
 * @param {number} [maxLength=15]
 * @returns {boolean}
 */
export function isValidWordLength(word, minLength = 3, maxLength = 15) {
  const len = String(word || "").trim().length;
  return len >= minLength && len <= maxLength;
}

/**
 * Sanitize user text input by trimming and removing control characters.
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  return String(input || "")
    .trim()
    // eslint-disable-next-line no-control-regex
    .replace(/[\x00-\x1F\x7F]/g, "")
    .slice(0, 200);
}

/**
 * Check if text contains only printable ASCII characters.
 * @param {string} text
 * @returns {boolean}
 */
export function isPrintableASCII(text) {
  return /^[\x20-\x7E]*$/.test(String(text || ""));
}

/**
 * Validate a room code format.
 * @param {string} code
 * @returns {boolean}
 */
export function isValidRoomCode(code) {
  return /^[a-zA-Z0-9_-]{4,32}$/.test(String(code || "").trim());
}

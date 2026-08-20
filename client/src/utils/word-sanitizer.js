/**
 * Word Sanitizer and Normalization Utility
 */

/**
 * Normalizes input word string (strips non-alphabetic chars and converts to uppercase).
 * @param {string} rawWord
 * @returns {string}
 */
export function normalizeSubmittedWord(rawWord) {
  if (!rawWord || typeof rawWord !== "string") return "";
  return rawWord.trim().replace(/[^a-zA-Z]/g, "").toUpperCase();
}

/**
 * Checks if a word satisfies minimum and maximum length constraints.
 * @param {string} word
 * @param {number} [minLength=3]
 * @param {number} [maxLength=15]
 * @returns {boolean}
 */
export function isValidWordLength(word, minLength = 3, maxLength = 15) {
  if (!word || typeof word !== "string") return false;
  const len = word.trim().length;
  return len >= minLength && len <= maxLength;
}

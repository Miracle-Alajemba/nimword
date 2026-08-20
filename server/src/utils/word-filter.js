/**
 * Profanity and offensive word filtering utility for WordPot chat rooms and display names.
 */

const BLOCKED_WORDS = [
  "BADWORD",
  "SCAM",
  "PHISH",
  "EXPLOIT",
  "SPAM",
];

/**
 * Filter text input by replacing blocked words with asterisks.
 * @param {string} text
 * @returns {string}
 */
export function filterProfanity(text) {
  if (!text || typeof text !== "string") return "";
  let result = text;
  for (const word of BLOCKED_WORDS) {
    const regex = new RegExp(word, "gi");
    result = result.replace(regex, "*".repeat(word.length));
  }
  return result;
}

/**
 * Check if text contains any blocked words.
 * @param {string} text
 * @returns {boolean}
 */
export function containsProfanity(text) {
  if (!text || typeof text !== "string") return false;
  const upper = text.toUpperCase();
  for (const word of BLOCKED_WORDS) {
    if (upper.includes(word)) return true;
  }
  return false;
}

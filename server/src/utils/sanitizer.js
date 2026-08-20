/**
 * Utility functions for sanitizing user inputs and EVM parameters in WordPot.
 */

/**
 * Sanitize EVM wallet address to lowercase standard checksum string.
 * @param {string} address
 * @returns {string}
 */
export function sanitizeWalletAddress(address) {
  if (!address || typeof address !== "string") return "";
  const trimmed = address.trim();
  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) return "";
  return trimmed.toLowerCase();
}

/**
 * Sanitize player username / display name.
 * Strips HTML tags, trims whitespace, caps at 24 chars.
 * @param {string} username
 * @returns {string}
 */
export function sanitizeUsername(username) {
  if (!username || typeof username !== "string") return "Anonymous Player";
  const clean = username.replace(/<[^>]*>/g, "").trim();
  if (clean.length === 0) return "Anonymous Player";
  return clean.slice(0, 24);
}

/**
 * Sanitize search or sub-word query string (uppercase, A-Z only).
 * @param {string} word
 * @returns {string}
 */
export function sanitizeWordInput(word) {
  if (!word || typeof word !== "string") return "";
  return word.trim().toUpperCase().replace(/[^A-Z]/g, "");
}

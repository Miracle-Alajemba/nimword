/**
 * Client-side username helper for WordPot player profiles.
 */

import { getPlayerAlias } from "./ui-helpers.js";

const USERNAME_STORAGE_PREFIX = "wordpot_username_";

/**
 * Get saved player username for a wallet address or fallback to default alias.
 * @param {string} walletAddress
 * @returns {string}
 */
export function getSavedUsername(walletAddress) {
  if (!walletAddress || typeof walletAddress !== "string") {
    return "Player";
  }
  if (typeof window === "undefined") {
    return getPlayerAlias(walletAddress);
  }

  const key = `${USERNAME_STORAGE_PREFIX}${walletAddress.toLowerCase().trim()}`;
  const saved = window.localStorage.getItem(key);
  if (saved && saved.trim()) {
    return saved.trim();
  }

  return getPlayerAlias(walletAddress);
}

/**
 * Save custom username for a wallet address.
 * @param {string} walletAddress
 * @param {string} username
 * @returns {boolean} True if saved successfully
 */
export function saveCustomUsername(walletAddress, username) {
  if (!walletAddress || typeof walletAddress !== "string" || !username || typeof username !== "string") {
    return false;
  }
  const clean = username.trim();
  if (clean.length < 3 || clean.length > 16 || !/^[a-zA-Z0-9_ -]+$/.test(clean)) {
    return false;
  }

  if (typeof window !== "undefined") {
    const key = `${USERNAME_STORAGE_PREFIX}${walletAddress.toLowerCase().trim()}`;
    window.localStorage.setItem(key, clean);
    return true;
  }

  return false;
}

/**
 * Wallet address formatting utilities.
 */

/**
 * Truncate a wallet address to a short display format.
 * @param {string} address - Full wallet address
 * @param {number} [startChars=6] - Characters from the start to keep
 * @param {number} [endChars=4] - Characters from the end to keep
 * @returns {string}
 */
export function truncateAddress(address, startChars = 6, endChars = 4) {
  if (!address || typeof address !== "string") return "";
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}…${address.slice(-endChars)}`;
}

import { isNimiqAddress } from "./nimiq-identicon.js";

/**
 * Check if a string is a valid wallet address (Nimiq or EVM).
 * @param {string} address
 * @returns {boolean}
 */
export function isValidAddress(address) {
  if (!address) return false;
  const str = String(address).trim();
  if (isNimiqAddress(str)) return true;
  return /^0x[a-fA-F0-9]{40}$/.test(str);
}

/**
 * Normalize an address to lowercase with checksum-ready format.
 * @param {string} address
 * @returns {string}
 */
export function normalizeAddress(address) {
  if (!address || typeof address !== "string") return "";
  return address.trim().toLowerCase();
}

/**
 * Compare two addresses case-insensitively.
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
export function addressesEqual(a, b) {
  return normalizeAddress(a) === normalizeAddress(b);
}

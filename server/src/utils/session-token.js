/**
 * Session token utility for signing and validating player match sessions.
 */

import crypto from "node:crypto";

/**
 * Generate a secure hex session token for a wallet address and room ID.
 * @param {string} walletAddress
 * @param {string} roomId
 * @param {string} [secret="wordpot_session_secret"]
 * @returns {string}
 */
export function generateSessionToken(walletAddress, roomId, secret = "wordpot_session_secret") {
  if (!walletAddress || !roomId) return "";
  const payload = `${walletAddress.toLowerCase()}:${roomId}`;
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verify a session token against wallet address and room ID.
 * @param {string} token
 * @param {string} walletAddress
 * @param {string} roomId
 * @param {string} [secret="wordpot_session_secret"]
 * @returns {boolean}
 */
export function verifySessionToken(token, walletAddress, roomId, secret = "wordpot_session_secret") {
  if (!token || typeof token !== "string") return false;
  const expected = generateSessionToken(walletAddress, roomId, secret);
  if (!expected) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

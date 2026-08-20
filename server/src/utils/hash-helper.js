import crypto from "crypto";

/**
 * Creates SHA-256 hash string for an input string.
 * @param {string} input
 * @returns {string} Hex hash string
 */
export function sha256Hash(input) {
  if (!input || typeof input !== "string") return "";
  return crypto.createHash("sha256").update(input).digest("hex");
}

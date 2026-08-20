/**
 * Server-side username validation and formatting for WordPot.
 */

import { filterProfanity } from "./word-filter.js";

/**
 * Validate and format player display username.
 * @param {string} username
 * @returns {{ valid: boolean, formatted: string, error?: string }}
 */
export function validateAndFormatUsername(username) {
  if (!username || typeof username !== "string") {
    return { valid: false, formatted: "Anonymous Player", error: "Username is required" };
  }

  const clean = username.replace(/<[^>]*>/g, "").trim();

  if (clean.length < 3) {
    return { valid: false, formatted: "Anonymous Player", error: "Username must be at least 3 characters" };
  }

  if (clean.length > 16) {
    return { valid: false, formatted: "Anonymous Player", error: "Username cannot exceed 16 characters" };
  }

  if (!/^[a-zA-Z0-9_ -]+$/.test(clean)) {
    return { valid: false, formatted: "Anonymous Player", error: "Username contains invalid characters" };
  }

  const sanitized = filterProfanity(clean);

  return {
    valid: true,
    formatted: sanitized,
  };
}

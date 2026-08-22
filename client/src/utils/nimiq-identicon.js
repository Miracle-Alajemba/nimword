import Identicons, { IdenticonsAssets } from "@nimiq/identicons/dist/identicons.bundle.min.js";

// Ensure IdenticonsAssets is available globally as required by @nimiq/identicons bundle
const g = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : global;
if (g && g.IdenticonsAssets === undefined) {
  g.IdenticonsAssets = IdenticonsAssets;
}

const identiconCache = new Map();

/**
 * Validates a Nimiq address starting with NQ
 */
export function isNimiqAddress(address = "") {
  const clean = String(address).replace(/\s+/g, "").toUpperCase();
  return /^NQ[0-9A-Z]{34}$/.test(clean);
}

/**
 * Validates general wallet address (EVM or Nimiq)
 */
export function isWalletAddress(address = "") {
  if (!address) return false;
  const str = String(address).trim();
  if (isNimiqAddress(str)) return true;
  return /^0x[a-fA-F0-9]{40}$/.test(str);
}

/**
 * Formats a Nimiq address into 9 blocks of 4 characters: NQxx xxxx ...
 */
export function formatNimiqAddress(address = "") {
  if (!address) return "";
  const clean = String(address).replace(/\s+/g, "").toUpperCase();
  if (!clean.startsWith("NQ")) return address;
  return clean.replace(/(.{4})/g, "$1 ").trim();
}

/**
 * Shortens a Nimiq address for UI header: NQ43...43K9
 */
export function shortenNimiqAddress(address = "") {
  if (!address) return "--";
  const clean = String(address).replace(/\s+/g, "").toUpperCase();
  if (clean.length < 8) return clean;
  return `${clean.slice(0, 4)}...${clean.slice(-4)}`;
}

export function shortenWalletAddress(address = "") {
  if (!address) return "--";
  const clean = String(address).trim();
  if (clean.toUpperCase().startsWith("NQ")) {
    return shortenNimiqAddress(clean);
  }
  return `${clean.slice(0, 6)}...${clean.slice(-4)}`;
}

/**
 * Generates the official Nimiq Identicon data URL (same hash -> same hex face / parts)
 */
export async function getNimiqAvatarAsync(address = "") {
  if (!address) return "";
  const clean = String(address).trim();
  if (identiconCache.has(clean)) {
    return identiconCache.get(clean);
  }
  try {
    const dataUrl = await Identicons.toDataUrl(clean);
    identiconCache.set(clean, dataUrl);
    return dataUrl;
  } catch (err) {
    console.warn("Failed to generate official Nimiq identicon:", err);
    return "";
  }
}

/**
 * Synchronous accessor returning cached data URL or placeholder
 */
export function getNimiqAvatar(address = "") {
  if (!address) return "";
  const clean = String(address).trim();
  if (identiconCache.has(clean)) {
    return identiconCache.get(clean);
  }
  // Trigger async load to populate cache for subsequent renders
  getNimiqAvatarAsync(clean).catch(() => {});
  return "";
}

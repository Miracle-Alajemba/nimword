import Identicon from "identicon.js";

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
 * Simple string hash to generate a hex seed for Identicon
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  // Convert to 15-char hex string required by identicon.js
  const hex = Math.abs(hash).toString(16).padStart(15, "0");
  return hex.repeat(2).slice(0, 15);
}

/**
 * Generates an Identicon data URI for a given address
 */
export function getNimiqAvatar(address = "") {
  if (!address) return "";
  try {
    const cleanAddress = String(address).replace(/\s+/g, "").toUpperCase();
    const hash = hashString(cleanAddress);
    const options = {
      foreground: [0, 180, 216, 255], // Nimiq Blue #00B4D8
      background: [16, 25, 35, 255],  // Dark glass background
      margin: 0.1,
      size: 64,
      format: "svg",
    };
    const data = new Identicon(hash, options).toString();
    return `data:image/svg+xml;base64,${data}`;
  } catch (err) {
    console.warn("Identicon generation error:", err);
    return "";
  }
}

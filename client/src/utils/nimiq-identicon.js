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
 * Generates a simple SVG avatar from a wallet address hash.
 * No external dependencies — pure inline SVG generation.
 */
export function getNimiqAvatar(address = "") {
  if (!address) return "";
  try {
    const cleanAddress = String(address).replace(/\s+/g, "").toUpperCase();
    const hash = hashString(cleanAddress);

    // Generate a deterministic color from the hash
    const hue = parseInt(hash.slice(0, 4), 16) % 360;
    const sat = 60 + (parseInt(hash.slice(4, 6), 16) % 30);
    const lightness = 45 + (parseInt(hash.slice(6, 8), 16) % 15);
    const bgHue = (hue + 180) % 360;

    // Create a simple SVG identicon with geometric shapes
    const cells = 5;
    const cellSize = 10;
    const size = cells * cellSize;
    let rects = "";

    for (let x = 0; x < Math.ceil(cells / 2); x++) {
      for (let y = 0; y < cells; y++) {
        const idx = x * cells + y;
        const charCode = hash.charCodeAt(idx % hash.length);
        if (charCode % 2 === 0) {
          // Mirror horizontally for symmetry
          rects += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="hsl(${hue}, ${sat}%, ${lightness}%)" />`;
          const mirrorX = (cells - 1 - x) * cellSize;
          rects += `<rect x="${mirrorX}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="hsl(${hue}, ${sat}%, ${lightness}%)" />`;
        }
      }
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="64" height="64"><rect width="${size}" height="${size}" fill="hsl(${bgHue}, 20%, 15%)" />${rects}</svg>`;
    const encoded = btoa(svg);
    return `data:image/svg+xml;base64,${encoded}`;
  } catch (err) {
    console.warn("Avatar generation error:", err);
    return "";
  }
}

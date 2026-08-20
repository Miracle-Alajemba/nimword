import {
  formatNimiqAddress,
  getNimiqAvatar,
  isNimiqAddress,
  shortenNimiqAddress,
} from "./nimiq-identicon.js";

export { formatNimiqAddress, getNimiqAvatar, isNimiqAddress, shortenNimiqAddress };

export function shortenWalletAddress(value) {
  if (!value) return "--";
  const str = String(value).trim();
  if (str.toUpperCase().startsWith("NQ")) {
    return shortenNimiqAddress(str);
  }
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
}

export function shortenHash(value) {
  if (!value) return "--";
  return `${value.slice(0, 10)}...${value.slice(-6)}`;
}

export function isWalletAddress(value) {
  if (!value) return false;
  const str = String(value).trim();
  if (isNimiqAddress(str)) return true;
  return /^0x[a-fA-F0-9]{40}$/.test(str);
}

export function getPlayerAlias(walletAddress, fallbackIndex = 1) {
  if (!walletAddress) return `Player ${fallbackIndex}`;
  if (typeof window !== "undefined") {
    const key = `nimword_username_${walletAddress.toLowerCase().trim()}`;
    const saved = window.localStorage.getItem(key);
    if (saved && saved.trim()) return saved.trim();
  }
  const short = shortenWalletAddress(walletAddress);
  return `Player ${short.slice(0, 6).toUpperCase()}`;
}

export function getAvatarStyle(walletAddress = "") {
  return {
    backgroundImage: `url(${getNimiqAvatar(walletAddress)})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };
}


export function formatEventTime(value) {
  if (!value) return "--:--";

  return new Intl.DateTimeFormat([], {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatRoomTimer(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

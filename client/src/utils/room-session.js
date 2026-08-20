import { ROOM_SESSION_STORAGE_KEY } from "../config/app-config.js";

export function saveRoomSession(session) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROOM_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function readRoomSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(ROOM_SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed?.roomId || !parsed?.playerId || !parsed?.walletAddress) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function clearRoomSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ROOM_SESSION_STORAGE_KEY);
}

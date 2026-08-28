/**
 * Client-side username helper for NimWord player profiles.
 */

import { getPlayerAlias } from "./ui-helpers.js";

const USERNAME_STORAGE_PREFIX = "nimword_username_";

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

const STATS_STORAGE_PREFIX = "nimword_player_stats_";

/**
 * Get dynamic lifetime career stats for a player wallet.
 */
export function getPlayerStats(walletAddress) {
  const defaults = {
    gamesPlayed: 0,
    gamesWon: 0,
    totalScore: 0,
    totalNimWon: 0,
    winStreak: 0,
    bestWord: "-",
    bestWordScore: 0,
    dailyCompleted: 0,
  };

  if (!walletAddress || typeof window === "undefined") {
    return defaults;
  }

  try {
    const key = `${STATS_STORAGE_PREFIX}${walletAddress.toLowerCase().trim()}`;
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaults, ...parsed };
    }
  } catch (e) {
    console.warn("Error reading player stats:", e);
  }

  return defaults;
}

/**
 * Update player lifetime stats after a match, practice, or daily challenge.
 */
export function updatePlayerStats(walletAddress, update = {}) {
  if (!walletAddress || typeof window === "undefined") return;

  const current = getPlayerStats(walletAddress);
  const updated = {
    ...current,
    gamesPlayed: current.gamesPlayed + (update.gamesPlayed || 0),
    gamesWon: current.gamesWon + (update.gamesWon || 0),
    totalScore: current.totalScore + (update.score || 0),
    totalNimWon: Number((current.totalNimWon + (update.nimWon || 0)).toFixed(2)),
    winStreak: update.won ? current.winStreak + 1 : update.lost ? 0 : current.winStreak,
    dailyCompleted: current.dailyCompleted + (update.dailyCompleted || 0),
    bestWord:
      update.bestWordScore && update.bestWordScore > (current.bestWordScore || 0)
        ? update.bestWord
        : current.bestWord,
    bestWordScore:
      update.bestWordScore && update.bestWordScore > (current.bestWordScore || 0)
        ? update.bestWordScore
        : current.bestWordScore,
  };

  try {
    const key = `${STATS_STORAGE_PREFIX}${walletAddress.toLowerCase().trim()}`;
    window.localStorage.setItem(key, JSON.stringify(updated));
  } catch (e) {
    console.warn("Error writing player stats:", e);
  }

  return updated;
}

const DAILY_LEADERBOARD_KEY = "nimword_daily_leaderboard_cache";

/**
 * Record or update a score in the local daily leaderboard cache.
 */
export function recordDailyLeaderboardEntry(walletAddress, score = 0) {
  if (!walletAddress || typeof window === "undefined") return;

  try {
    const raw = window.localStorage.getItem(DAILY_LEADERBOARD_KEY);
    let list = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(list)) list = [];

    const username = getSavedUsername(walletAddress);
    const existingIdx = list.findIndex(
      (e) => String(e.walletAddress).toLowerCase() === String(walletAddress).toLowerCase()
    );

    if (existingIdx >= 0) {
      if (score > (list[existingIdx].score || 0)) {
        list[existingIdx].score = score;
        list[existingIdx].username = username;
      }
      list[existingIdx].totalScore = (list[existingIdx].totalScore || 0) + score;
      list[existingIdx].roundsPlayed = (list[existingIdx].roundsPlayed || 1) + 1;
    } else {
      list.push({
        walletAddress,
        username,
        score,
        totalScore: score,
        roundsPlayed: 1,
      });
    }

    list.sort((a, b) => (b.score || 0) - (a.score || 0));
    list = list.map((item, idx) => ({ ...item, rank: idx + 1 }));

    window.localStorage.setItem(DAILY_LEADERBOARD_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn("Error recording local daily leaderboard entry:", e);
  }
}

/**
 * Get cached local daily leaderboard standings.
 */
export function getLocalDailyLeaderboard() {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(DAILY_LEADERBOARD_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) return list;
    }
  } catch (e) {
    console.warn("Error reading local daily leaderboard:", e);
  }
  return [];
}

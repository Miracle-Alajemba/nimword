/**
 * Matchmaking & lobby queue sorting utilities for WordPot.
 */

/**
 * Filter lobbies that are open for joining (active, not full, not started, not expired).
 * @param {Array<{ roomId: string, playerCount: number, maxPlayers: number, started: boolean, createdAt: number }>} lobbies
 * @param {number} [expiryMs=240000] 4 minutes
 * @param {number} [now=Date.now()]
 * @returns {Array}
 */
export function findAvailableLobbies(lobbies = [], expiryMs = 240000, now = Date.now()) {
  if (!Array.isArray(lobbies)) return [];

  return lobbies.filter((lobby) => {
    if (!lobby || lobby.started) return false;
    const count = lobby.playerCount || 0;
    const max = lobby.maxPlayers || 4;
    if (count >= max) return false;

    const age = now - (lobby.createdAt || now);
    if (age > expiryMs) return false;

    return true;
  });
}

/**
 * Sort available lobbies prioritizing almost-full lobbies to minimize wait times.
 * @param {Array} lobbies
 * @returns {Array}
 */
export function sortLobbiesByFillRate(lobbies = []) {
  if (!Array.isArray(lobbies)) return [];
  return [...lobbies].sort((a, b) => (b.playerCount || 0) - (a.playerCount || 0));
}

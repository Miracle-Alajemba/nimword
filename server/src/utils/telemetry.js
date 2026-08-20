/**
 * System Telemetry & Monitoring Calculator for WordPot Server
 */

/**
 * Calculates process memory usage in megabytes.
 * @returns {{ heapUsedMb: number, heapTotalMb: number, rssMb: number }}
 */
export function getMemoryUsage() {
  const mem = process.memoryUsage();
  return {
    heapUsedMb: Number((mem.heapUsed / 1024 / 1024).toFixed(2)),
    heapTotalMb: Number((mem.heapTotal / 1024 / 1024).toFixed(2)),
    rssMb: Number((mem.rss / 1024 / 1024).toFixed(2)),
  };
}

/**
 * Formats process uptime seconds into human-readable duration (e.g. "2h 15m 30s").
 * @param {number} [seconds=process.uptime()]
 * @returns {string}
 */
export function formatUptime(seconds = process.uptime()) {
  const sec = Math.floor(seconds);
  const days = Math.floor(sec / 86400);
  const hours = Math.floor((sec % 86400) / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remSec = sec % 60;

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${remSec}s`);

  return parts.join(" ");
}

/**
 * Aggregates room metrics.
 * @param {Array<object>} rooms
 * @returns {{ totalRooms: number, activeRooms: number, waitingRooms: number, finishedRooms: number }}
 */
export function calculateRoomMetrics(rooms = []) {
  if (!Array.isArray(rooms)) {
    return { totalRooms: 0, activeRooms: 0, waitingRooms: 0, finishedRooms: 0 };
  }

  let activeRooms = 0;
  let waitingRooms = 0;
  let finishedRooms = 0;

  for (const r of rooms) {
    if (r.status === "active") activeRooms++;
    else if (r.status === "waiting") waitingRooms++;
    else if (r.status === "finished") finishedRooms++;
  }

  return {
    totalRooms: rooms.length,
    activeRooms,
    waitingRooms,
    finishedRooms,
  };
}

/**
 * Aggregates active player count from rooms list.
 * @param {Array<object>} rooms
 * @returns {number}
 */
export function calculateActivePlayers(rooms = []) {
  if (!Array.isArray(rooms)) return 0;
  const uniquePlayers = new Set();
  for (const room of rooms) {
    if (Array.isArray(room.players)) {
      for (const p of room.players) {
        if (p?.walletAddress) {
          uniquePlayers.add(p.walletAddress.toLowerCase());
        }
      }
    }
  }
  return uniquePlayers.size;
}

/**
 * Builds complete server health telemetry payload.
 * @param {object} options
 * @param {Array<object>} [options.rooms=[]]
 * @param {boolean} [options.dbConnected=false]
 * @param {boolean} [options.redisConnected=false]
 * @returns {object}
 */
export function buildTelemetryPayload({ rooms = [], dbConnected = false, redisConnected = false } = {}) {
  const memory = getMemoryUsage();
  const uptimeString = formatUptime();
  const roomMetrics = calculateRoomMetrics(rooms);
  const activePlayers = calculateActivePlayers(rooms);

  return {
    status: "ok",
    service: "wordpot-server",
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    uptimeFormatted: uptimeString,
    memory,
    rooms: roomMetrics,
    activePlayers,
    services: {
      database: dbConnected ? "connected" : "fallback_mode",
      redis: redisConnected ? "connected" : "in_memory",
    },
  };
}

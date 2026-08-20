export function formatDailyStats(claimedCount = 0, poolCelo = "0.05") {
  return { claimedCount, poolCelo, timestamp: new Date().toISOString() };
}

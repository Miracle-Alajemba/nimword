export function formatDailyStats(claimedCount = 0, poolNimiq = "0.05") {
  return { claimedCount, poolNimiq, timestamp: new Date().toISOString() };
}

export function isSocketAlive(lastPingTime, maxIdleMs = 30000) {
  if (!lastPingTime) return false;
  return Date.now() - new Date(lastPingTime).getTime() <= maxIdleMs;
}

export function isCacheStale(lastUpdated, maxAgeMs = 60000) {
  if (!lastUpdated) return true;
  return Date.now() - new Date(lastUpdated).getTime() >= maxAgeMs;
}

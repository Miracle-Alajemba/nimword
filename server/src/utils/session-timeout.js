export function isSessionExpired(lastActive, maxInactiveMs = 1800000) {
  if (!lastActive) return true;
  return Date.now() - new Date(lastActive).getTime() > maxInactiveMs;
}

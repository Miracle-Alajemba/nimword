export function isSessionExpired(createdIso, ttlSeconds = 3600) {
  if (!createdIso) return true;
  const diffSeconds = (Date.now() - new Date(createdIso).getTime()) / 1000;
  return diffSeconds >= ttlSeconds;
}

export function getRoomCacheKey(roomId) {
  return `nimword:room:${roomId}`;
}
export function getUserCacheKey(address) {
  return `nimword:user:${address.toLowerCase()}`;
}

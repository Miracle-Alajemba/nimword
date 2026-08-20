export function getRoomCacheKey(roomId) {
  return `wordpot:room:${roomId}`;
}
export function getUserCacheKey(address) {
  return `wordpot:user:${address.toLowerCase()}`;
}

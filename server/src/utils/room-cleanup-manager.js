export function getStaleRooms(roomsMap, maxAgeMs = 1800000) {
  const now = Date.now();
  const stale = [];
  for (const [id, room] of roomsMap.entries()) {
    if (now - new Date(room.createdAt).getTime() > maxAgeMs) stale.push(id);
  }
  return stale;
}

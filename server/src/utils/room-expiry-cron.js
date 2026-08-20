export function findExpiredRooms(rooms = [], maxIdleMinutes = 30) {
  const cutoff = Date.now() - maxIdleMinutes * 60 * 1000;
  return rooms.filter((r) => !r.settled && new Date(r.updatedAt || r.createdAt).getTime() < cutoff);
}

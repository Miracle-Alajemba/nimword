export function isRoomJoinable(room) {
  if (!room) return false;
  return !room.settled && !room.cancelled && room.playerCount < (room.maxPlayers || 4);
}

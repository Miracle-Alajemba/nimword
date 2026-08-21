export function buildRoomInviteLink(roomCode = "", origin = "https://nimword.app") {
  return `${origin}/join?code=${encodeURIComponent(roomCode)}`;
}

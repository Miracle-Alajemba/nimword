export function buildRoomInviteLink(roomCode = "", origin = "https://wordpot.app") {
  return `${origin}/join?code=${encodeURIComponent(roomCode)}`;
}

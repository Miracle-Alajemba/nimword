export function getFillPercentage(currentPlayers = 0, maxPlayers = 4) {
  if (maxPlayers <= 0) return 0;
  return Math.round((currentPlayers / maxPlayers) * 100);
}

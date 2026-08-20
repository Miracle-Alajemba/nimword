export function calculateTileSize(containerWidth = 360, letterCount = 7) {
  const available = containerWidth - (letterCount - 1) * 8;
  return Math.max(36, Math.floor(available / letterCount));
}

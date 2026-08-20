export function calculateLevelFromXp(xp = 0) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

export function calculateComboMultiplier(consecutiveWords = 0) {
  if (consecutiveWords >= 5) return 2.0;
  if (consecutiveWords >= 3) return 1.5;
  if (consecutiveWords >= 2) return 1.2;
  return 1.0;
}

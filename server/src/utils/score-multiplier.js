export function getLengthMultiplier(wordLength = 0) {
  if (wordLength >= 8) return 2.5;
  if (wordLength >= 6) return 1.8;
  if (wordLength >= 4) return 1.2;
  return 1.0;
}

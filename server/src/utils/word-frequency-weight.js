export function getWordRarityBonus(wordLength = 3) {
  if (wordLength >= 9) return 3.0;
  if (wordLength >= 7) return 2.0;
  if (wordLength >= 5) return 1.4;
  return 1.0;
}

export function calculateWordScore(word = "") {
  const length = word.trim().length;
  if (length === 0) return 0;
  if (length <= 3) return 10;
  if (length <= 5) return 25;
  if (length <= 7) return 50;
  return 100;
}

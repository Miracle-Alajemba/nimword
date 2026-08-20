export function calculateLengthPoints(word = "") {
  const len = word.length;
  if (len >= 8) return 100;
  if (len >= 6) return 50;
  if (len >= 4) return 25;
  return 10;
}

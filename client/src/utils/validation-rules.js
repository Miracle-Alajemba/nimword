export function isValidWordLength(word, min = 3, max = 12) {
  const len = word.trim().length;
  return len >= min && len <= max;
}

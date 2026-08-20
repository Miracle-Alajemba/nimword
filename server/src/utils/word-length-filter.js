export function filterWordsByLength(words = [], minLen = 3, maxLen = 8) {
  return words.filter((w) => w.length >= minLen && w.length <= maxLen);
}

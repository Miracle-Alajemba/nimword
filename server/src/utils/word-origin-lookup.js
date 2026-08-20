export function getWordCategory(word = "") {
  const len = word.length;
  if (len >= 8) return "Grand";
  if (len >= 6) return "Major";
  if (len >= 4) return "Standard";
  return "Basic";
}

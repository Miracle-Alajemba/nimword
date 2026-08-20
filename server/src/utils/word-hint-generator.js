export function generateWordHint(word = "") {
  if (!word || word.length <= 2) return word;
  return word[0] + "_".repeat(word.length - 2) + word[word.length - 1];
}

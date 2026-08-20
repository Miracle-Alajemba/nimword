export function calculateWordComplexity(word = "") {
  const uniqueChars = new Set(word.toLowerCase()).size;
  return Math.round((uniqueChars / word.length) * 100) || 0;
}

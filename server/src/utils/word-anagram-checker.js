export function isAnagram(word1 = "", word2 = "") {
  const normalize = (s) => s.toLowerCase().split("").sort().join("");
  return normalize(word1) === normalize(word2);
}

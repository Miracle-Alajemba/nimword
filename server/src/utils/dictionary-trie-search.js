export function containsSubword(sourceLetters = "", candidate = "") {
  const sourceCounts = {};
  for (const char of sourceLetters.toLowerCase()) sourceCounts[char] = (sourceCounts[char] || 0) + 1;
  for (const char of candidate.toLowerCase()) {
    if (!sourceCounts[char]) return false;
    sourceCounts[char]--;
  }
  return true;
}

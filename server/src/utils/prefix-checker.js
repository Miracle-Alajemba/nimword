export function isValidPrefix(prefix = "", validWords = []) {
  const lower = prefix.toLowerCase();
  return validWords.some((w) => w.toLowerCase().startsWith(lower));
}

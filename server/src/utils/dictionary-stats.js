export function analyzeDictionary(words = []) {
  const total = words.length;
  const avgLen = total > 0 ? words.reduce((acc, w) => acc + w.length, 0) / total : 0;
  return { total, avgLen: Math.round(avgLen * 10) / 10 };
}

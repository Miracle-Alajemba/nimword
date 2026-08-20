export function isRhymeCandidate(w1 = "", w2 = "") {
  if (w1.length < 3 || w2.length < 3) return false;
  return w1.slice(-3).toLowerCase() === w2.slice(-3).toLowerCase();
}

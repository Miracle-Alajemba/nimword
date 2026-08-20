export function calculatePercent(part = 0, total = 100) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

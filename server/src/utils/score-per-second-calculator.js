export function calculatePace(score = 0, seconds = 60) {
  if (seconds <= 0) return 0;
  return Math.round((score / seconds) * 10) / 10;
}

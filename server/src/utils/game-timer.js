export function isTimerExpired(startTime, maxSeconds = 60) {
  if (!startTime) return true;
  const elapsed = (Date.now() - new Date(startTime).getTime()) / 1000;
  return elapsed >= maxSeconds;
}

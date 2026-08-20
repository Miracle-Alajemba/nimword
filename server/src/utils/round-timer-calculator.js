export function calculateRemainingSeconds(startTime, durationSeconds = 60) {
  if (!startTime) return durationSeconds;
  const elapsed = Math.floor((Date.now() - new Date(startTime).getTime()) / 1000);
  return Math.max(0, durationSeconds - elapsed);
}

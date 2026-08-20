export function formatSecondsLeftDisplay(seconds = 0) {
  if (seconds <= 0) return "TIME UP!";
  return `${seconds}s remaining`;
}

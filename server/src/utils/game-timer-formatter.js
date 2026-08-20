export function formatTimerPillDisplay(secondsLeft = 60) {
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

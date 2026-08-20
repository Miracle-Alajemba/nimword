export function getGameStage(secondsLeft = 60, totalSeconds = 60) {
  const ratio = secondsLeft / totalSeconds;
  if (ratio > 0.5) return "early";
  if (ratio > 0.2) return "mid";
  return "climax";
}

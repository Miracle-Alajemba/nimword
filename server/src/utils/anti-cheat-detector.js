export function isSubmissionPlausible(wordsCount = 0, elapsedSeconds = 60) {
  if (elapsedSeconds <= 0) return false;
  const wordsPerSecond = wordsCount / elapsedSeconds;
  return wordsPerSecond <= 1.5;
}

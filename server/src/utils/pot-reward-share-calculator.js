export function calculatePlayerShare(playerScore = 0, totalScore = 1, rewardPool = 100) {
  if (totalScore <= 0) return 0;
  return (playerScore / totalScore) * rewardPool;
}

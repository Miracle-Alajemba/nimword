export function calculateTieredReward(rank = 1, totalPrize = 100) {
  if (rank === 1) return totalPrize * 0.5;
  if (rank === 2) return totalPrize * 0.3;
  if (rank === 3) return totalPrize * 0.2;
  return 0;
}

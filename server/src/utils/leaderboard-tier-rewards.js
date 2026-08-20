export function getSeasonPrizeAllocation(rank = 1, prizePool = 1000) {
  if (rank === 1) return prizePool * 0.4;
  if (rank === 2) return prizePool * 0.25;
  if (rank === 3) return prizePool * 0.15;
  if (rank <= 10) return prizePool * 0.02;
  return 0;
}

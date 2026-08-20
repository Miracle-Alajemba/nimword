export function calculateTournamentPrizePool(entryFee = 1, playerCount = 16, devFeePercent = 10) {
  const gross = entryFee * playerCount;
  const netPrize = gross * (1 - devFeePercent / 100);
  return { gross, netPrize };
}

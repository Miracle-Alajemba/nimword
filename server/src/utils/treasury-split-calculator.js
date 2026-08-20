export function calculatePotSplit(totalPot = 100, devFeeBps = 1000) {
  const devFee = (totalPot * devFeeBps) / 10000;
  const prizePool = totalPot - devFee;
  return { devFee, prizePool };
}

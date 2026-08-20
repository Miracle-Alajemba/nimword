export function formatCeloBalanceShort(balanceWei = 0) {
  const celo = Number(balanceWei) / 1e18;
  if (celo >= 1000) return (celo / 1000).toFixed(1) + "k CELO";
  return celo.toFixed(2) + " CELO";
}

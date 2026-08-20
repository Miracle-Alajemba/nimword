export function formatCelo(weiAmount = 0) {
  const celo = Number(weiAmount) / 1e18;
  return celo.toFixed(4) + " CELO";
}

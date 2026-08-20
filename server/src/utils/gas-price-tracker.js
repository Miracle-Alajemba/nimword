export function formatGweiDisplay(weiAmount = 0) {
  const gwei = Number(weiAmount) / 1e9;
  return gwei.toFixed(2) + " Gwei";
}

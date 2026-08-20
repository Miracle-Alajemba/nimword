export function estimateGasFeeCelo(gasLimit = 100000, gasPriceGwei = 5) {
  const totalWei = BigInt(gasLimit) * BigInt(gasPriceGwei) * BigInt(1e9);
  return Number(totalWei) / 1e18;
}

export function addGasBuffer(gasPriceGwei = 5, bufferPercent = 20) {
  return Math.ceil(gasPriceGwei * (1 + bufferPercent / 100));
}

export function estimateRoomCreationGas(baseGas = 120000, marginPercent = 10) {
  return Math.ceil(baseGas * (1 + marginPercent / 100));
}

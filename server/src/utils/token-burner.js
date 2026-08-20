export function calculateBurnAmount(potAmount = 0, burnPercentage = 5) {
  return (potAmount * burnPercentage) / 100;
}

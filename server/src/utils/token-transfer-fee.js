export function calculateFeeDeduction(amount = 0, feeBps = 100) {
  return (amount * feeBps) / 10000;
}

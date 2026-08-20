export function calculateEloChange(ratingA = 1000, ratingB = 1000, scoreA = 1, kFactor = 32) {
  const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  return Math.round(kFactor * (scoreA - expectedA));
}

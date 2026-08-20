export function getPlayerTier(rating = 1000) {
  if (rating >= 2400) return "Diamond";
  if (rating >= 2000) return "Platinum";
  if (rating >= 1600) return "Gold";
  if (rating >= 1200) return "Silver";
  return "Bronze";
}

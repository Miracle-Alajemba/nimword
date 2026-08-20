export function buildReferralInviteUrl(address = "", baseUrl = "https://wordpot.vercel.app") {
  if (!address) return baseUrl;
  const code = address.toLowerCase().slice(2, 8);
  return `${baseUrl}?ref=${code}`;
}

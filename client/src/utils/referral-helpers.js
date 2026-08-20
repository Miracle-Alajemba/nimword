/**
 * Client helper to generate deterministic 6-character referral code from EVM wallet.
 * @param {string} address
 * @returns {string}
 */
export function generateReferralCode(address) {
  if (!address || typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
    return "";
  }
  const clean = address.trim().toLowerCase().replace(/^0x/, "");
  return clean.slice(-6).toUpperCase();
}

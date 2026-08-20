/**
 * Helper module for managing referral codes and affiliate commission calculations in WordPot.
 */

/**
 * Generate a deterministic 6-character referral code for a wallet address.
 * @param {string} address - Celo EVM wallet address
 * @returns {string} 6-character uppercase referral code
 */
export function generateReferralCode(address) {
  if (!address || typeof address !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(address.trim())) {
    return "";
  }
  const clean = address.trim().toLowerCase().replace(/^0x/, "");
  // Take last 6 characters of address in uppercase
  return clean.slice(-6).toUpperCase();
}

/**
 * Validate referral code format (6 alphanumeric characters).
 * @param {string} code
 * @returns {boolean}
 */
export function isValidReferralCode(code) {
  if (!code || typeof code !== "string") return false;
  return /^[A-Z0-9]{6}$/.test(code.trim().toUpperCase());
}

/**
 * Calculate affiliate referral commission split from treasury fee.
 * Default referral cut is 20% of treasury fee (equivalent to 2% of total room pot when treasury is 10%).
 * @param {number} treasuryFee - Total treasury fee in CELO
 * @param {number} referralBps - Basis points for referrer (e.g. 2000 = 20%)
 * @returns {{ netTreasuryFee: number, referrerCommission: number }}
 */
export function calculateReferralCommission(treasuryFee, referralBps = 2000) {
  if (typeof treasuryFee !== "number" || treasuryFee <= 0) {
    return { netTreasuryFee: 0, referrerCommission: 0 };
  }
  const bps = Math.max(0, Math.min(10000, referralBps));
  const referrerCommission = Number(((treasuryFee * bps) / 10000).toFixed(4));
  const netTreasuryFee = Number((treasuryFee - referrerCommission).toFixed(4));

  return {
    netTreasuryFee,
    referrerCommission,
  };
}

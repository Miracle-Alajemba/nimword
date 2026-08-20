export function calculateReferralSplit(feeAmount = 100, referrerPercent = 20) {
  const referrerShare = (feeAmount * referrerPercent) / 100;
  const treasuryShare = feeAmount - referrerShare;
  return { referrerShare, treasuryShare };
}

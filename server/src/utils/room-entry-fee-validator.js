export function isValidEntryFee(entryFeeWei = "0") {
  try {
    const fee = BigInt(entryFeeWei);
    return fee >= 0n;
  } catch (e) {
    return false;
  }
}

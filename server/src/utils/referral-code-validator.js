export function isValidReferralCodeFormat(code = "") {
  return typeof code === "string" && /^[A-Z0-9]{6,8}$/i.test(code);
}

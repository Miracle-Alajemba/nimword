import crypto from "crypto";
export function generateNimiqPayAuthNonce(address = "") {
  return crypto.createHash("sha256").update(`nimiqpay:${address.toLowerCase()}:${Date.now()}`).digest("hex");
}

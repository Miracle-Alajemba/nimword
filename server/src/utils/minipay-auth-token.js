import crypto from "crypto";
export function generateMiniPayAuthNonce(address = "") {
  return crypto.createHash("sha256").update(`minipay:${address.toLowerCase()}:${Date.now()}`).digest("hex");
}

import crypto from "crypto";
export function hashPayload(data) {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex");
}

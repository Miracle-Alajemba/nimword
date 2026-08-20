import crypto from "crypto";
export function generateRequestId() {
  return "req_" + crypto.randomBytes(8).toString("hex");
}

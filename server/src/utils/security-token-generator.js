import crypto from "crypto";
export function signPayload(payload = {}, secret = "default_secret") {
  const data = JSON.stringify(payload);
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

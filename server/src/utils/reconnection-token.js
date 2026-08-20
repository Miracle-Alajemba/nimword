import crypto from "crypto";
export function generateReconnectToken(socketId, walletAddress) {
  return crypto.createHash("sha256").update(`${socketId}:${walletAddress}:${Date.now()}`).digest("hex").slice(0, 16);
}

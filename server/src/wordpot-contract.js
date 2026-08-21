// Nimiq NIM payout service
// Sends NIM directly from treasury wallet to player using Nimiq RPC

const NIMIQ_RPC_URL = process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com";
const TREASURY_ADDRESS = process.env.NIMIQ_TREASURY_ADDRESS || "";
const TREASURY_PRIVATE_KEY = process.env.NIMIQ_TREASURY_PRIVATE_KEY || "";

function isNimiqAddress(value) {
  const v = String(value || "").trim().replace(/\s+/g, "").toUpperCase();
  return v.startsWith("NQ") && v.length >= 36;
}

export function createNimiqPayoutService() {
  if (!TREASURY_ADDRESS || !TREASURY_PRIVATE_KEY) {
    return {
      enabled: false,
      reason: "missing_treasury_config",
      async sendPayout() { return null; },
      async sendDailyReward() { return null; },
    };
  }

  return {
    enabled: true,
    reason: "ready",
    treasuryAddress: TREASURY_ADDRESS,

    async sendPayout({ to, amountNim }) {
      if (!isNimiqAddress(to)) {
        throw new Error("Invalid Nimiq wallet address.");
      }
      if (!amountNim || amountNim <= 0) {
        throw new Error("Payout amount must be greater than zero.");
      }

      // Send NIM via Nimiq RPC
      const response = await fetch(`${NIMIQ_RPC_URL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "sendRawTransaction",
          params: [{
            from: TREASURY_ADDRESS.replace(/\s+/g, ""),
            to: to.replace(/\s+/g, ""),
            value: Math.floor(amountNim * 100000), // NIM to Luna
            fee: 0,
          }],
          id: 1,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message || "NIM payout failed.");
      return { hash: data.result || `nim_tx_${Date.now()}` };
    },

    async sendDailyReward(toAddress, amountNim = 0.1) {
      console.log("[daily-reward] sending NIM", { toAddress, amountNim });
      const result = await this.sendPayout({ to: toAddress, amountNim });
      console.log("[daily-reward] tx_hash", result.hash);
      return result.hash;
    },
  };
}

// Keep this export name so server/src/index.js does not need changes
export const createWordPotContractService = createNimiqPayoutService;
export const createCeloPayoutService = createNimiqPayoutService;

import fetch from "node-fetch";

const NIMIQ_RPC_URL = process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com";
const TREASURY_ADDRESS = process.env.NIMIQ_TREASURY_ADDRESS || "";
const DAILY_REWARD_NIM = parseFloat(process.env.DAILY_REWARD_NIM || "0.1");

function isNimiqAddress(value) {
  const v = String(value || "").trim().replace(/\s+/g, "").toUpperCase();
  return v.startsWith("NQ") && v.length >= 36;
}

async function sendNimTransaction({ to, amountNim }) {
  const amountLuna = Math.floor(amountNim * 100000);
  const response = await fetch(NIMIQ_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "sendTransaction",
      params: [{
        from: TREASURY_ADDRESS.replace(/\s+/g, ""),
        to: to.replace(/\s+/g, ""),
        value: amountLuna,
        fee: 0,
      }],
      id: Date.now(),
    }),
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message || "Nimiq transaction failed.");
  return data.result || `nim_tx_${Date.now()}`;
}

export function createNimiqPayoutService() {
  if (!TREASURY_ADDRESS) {
    console.warn("[nimiq-payout] NIMIQ_TREASURY_ADDRESS not set — payouts disabled.");
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
        throw new Error(`Invalid Nimiq address: ${to}`);
      }
      if (!amountNim || amountNim <= 0) {
        throw new Error("Payout amount must be greater than zero.");
      }
      console.log("[nimiq-payout] sending", { to, amountNim });
      const hash = await sendNimTransaction({ to, amountNim });
      console.log("[nimiq-payout] success", { hash });
      return { hash };
    },

    async sendDailyReward(toAddress, amountNim = DAILY_REWARD_NIM) {
      console.log("[daily-reward] sending NIM", { toAddress, amountNim });
      const result = await this.sendPayout({ to: toAddress, amountNim });
      return result.hash;
    },
  };
}

export const createNimWordContractService = createNimiqPayoutService;

/**
 * Nimiq Payout Service for NimWord
 * 
 * Signs transactions LOCALLY using the treasury private key,
 * then broadcasts via public Nimiq RPC (sendRawTransaction).
 * No need for a self-hosted node with unlocked wallet.
 */

import fetch from "node-fetch";
import {
  Address,
  KeyPair,
  PrivateKey,
  TransactionBuilder,
} from "@nimiq/core";

const NIMIQ_RPC_URL = process.env.NIMIQ_RPC_URL || "https://rpc.nimiqwatch.com";
const TREASURY_ADDRESS = process.env.NIMIQ_TREASURY_ADDRESS || "";
const TREASURY_PRIVATE_KEY = process.env.NIMIQ_TREASURY_PRIVATE_KEY || "";
const DAILY_REWARD_NIM = parseFloat(process.env.DAILY_REWARD_NIM || "0.1");

// Nimiq mainnet network ID
const NIMIQ_NETWORK_ID = 24;

// 1 NIM = 100,000 Luna
const LUNA_PER_NIM = 100000;

function isNimiqAddress(value) {
  const v = String(value || "").trim().replace(/\s+/g, "").toUpperCase();
  return v.startsWith("NQ") && v.length >= 36;
}

/**
 * Fetch current block height from Nimiq RPC.
 * Used for transaction validity window.
 */
async function getBlockHeight() {
  const response = await fetch(NIMIQ_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "getBlockNumber",
      params: [],
      id: Date.now(),
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message || data.error || "Failed to get block height.");
  // Handle both { result: number } and { result: { data: number } }
  const height = typeof data.result === "number" ? data.result : data.result?.data;
  if (typeof height !== "number") throw new Error("Invalid block height response.");
  return height;
}

/**
 * Broadcast a signed transaction hex to the Nimiq network.
 */
async function broadcastTransaction(txHex) {
  const response = await fetch(NIMIQ_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "sendRawTransaction",
      params: [txHex],
      id: Date.now(),
    }),
  });
  const data = await response.json();
  if (data.error) {
    const msg = typeof data.error === "string" ? data.error : data.error.message || "Broadcast failed.";
    throw new Error(msg);
  }
  return data.result;
}

/**
 * Create, sign, and broadcast a NIM transaction from the treasury.
 */
async function sendNimTransaction({ to, amountNim }) {
  if (!TREASURY_PRIVATE_KEY || TREASURY_PRIVATE_KEY.startsWith("mock")) {
    throw new Error("NIMIQ_TREASURY_PRIVATE_KEY not configured — cannot sign transactions.");
  }

  const amountLuna = BigInt(Math.floor(amountNim * LUNA_PER_NIM));

  // 1. Import treasury keypair
  const privateKey = PrivateKey.fromHex(TREASURY_PRIVATE_KEY);
  const keyPair = KeyPair.derive(privateKey);
  const senderAddress = keyPair.toAddress();

  // Verify the derived address matches the configured treasury address
  const expectedClean = TREASURY_ADDRESS.replace(/\s+/g, "").toUpperCase();
  const derivedClean = senderAddress.toUserFriendlyAddress().replace(/\s+/g, "").toUpperCase();
  if (expectedClean && derivedClean !== expectedClean) {
    throw new Error(
      `Treasury key mismatch: key derives ${derivedClean} but env says ${expectedClean}`
    );
  }

  // 2. Parse recipient address
  const recipientClean = to.replace(/\s+/g, "");
  const recipientAddress = Address.fromUserFriendlyAddress(recipientClean);

  // 3. Get current block height for validity window
  const blockHeight = await getBlockHeight();

  // 4. Build transaction
  const tx = TransactionBuilder.newBasic(
    senderAddress,
    recipientAddress,
    amountLuna,
    BigInt(0),        // fee (0 for basic transactions)
    blockHeight,      // validity start height
    NIMIQ_NETWORK_ID, // mainnet = 24
  );

  // 5. Sign locally (in-place)
  tx.sign(keyPair);

  // 6. Serialize and broadcast
  const txHex = tx.toHex();
  const txHash = tx.hash();

  console.log(`[nimiq-payout] broadcasting tx ${txHash} (${amountNim} NIM → ${to})`);
  const result = await broadcastTransaction(txHex);

  return typeof result === "string" ? result : txHash;
}

export function createNimiqPayoutService() {
  const hasAddress = Boolean(TREASURY_ADDRESS);
  const hasKey = Boolean(TREASURY_PRIVATE_KEY) && !TREASURY_PRIVATE_KEY.startsWith("mock");

  if (!hasAddress || !hasKey) {
    const reason = !hasAddress ? "missing_treasury_address" : "missing_treasury_key";
    console.warn(`[nimiq-payout] ${reason} — payouts disabled.`);
    return {
      enabled: false,
      reason,
      async sendPayout() { return null; },
      async sendDailyReward() { return null; },
    };
  }

  console.info(`[nimiq-payout] Treasury: ${TREASURY_ADDRESS} — payouts ENABLED (local signing).`);

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

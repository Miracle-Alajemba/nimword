import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  createPublicClient,
  createWalletClient,
  decodeEventLog,
  getContract,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo, celoAlfajores } from "viem/chains";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadWordPotArtifact() {
  const artifactPath = path.resolve(__dirname, "./WordPotArena.json");

  const raw = fs.readFileSync(artifactPath, "utf8");
  return JSON.parse(raw);
}

function normalizePrivateKey(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  return raw.startsWith("0x") ? raw : `0x${raw}`;
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || "").trim());
}

function getCeloChain(chainId) {
  return Number(chainId) === 44787 ? celoAlfajores : celo;
}

export function createCeloPayoutService(options) {
  const rpcUrl = String(options?.rpcUrl || "https://forno.celo.org").trim();
  const operatorKey = normalizePrivateKey(options?.operatorPrivateKey);
  const chain = getCeloChain(options?.chainId);

  if (!operatorKey) {
    return {
      enabled: false,
      reason: "missing_operator_key",
      account: null,
      async sendPayout() {
        return null;
      },
    };
  }

  const account = privateKeyToAccount(operatorKey);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });

  return {
    enabled: true,
    reason: "ready",
    account: account.address,
    async sendPayout({ to, amountWei }) {
      if (!isAddress(to)) {
        throw new Error("Invalid payout wallet address.");
      }

      const value = BigInt(amountWei || 0);
      if (value <= 0n) {
        throw new Error("Payout amount must be greater than zero.");
      }

      const hash = await walletClient.sendTransaction({
        account,
        to,
        value,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt?.status === "reverted") {
        throw new Error(`Payout transaction reverted: ${hash}`);
      }

      return { hash };
    },
  };
}

export function createWordPotContractService(options) {
  const contractAddress = String(options?.contractAddress || "").trim();
  const rpcUrl = String(options?.rpcUrl || "https://forno.celo.org").trim();
  const operatorKey = normalizePrivateKey(options?.operatorPrivateKey);

  if (!isAddress(contractAddress)) {
    return {
      enabled: false,
      reason: "missing_contract_address",
      async createRoom() {
        return null;
      },
      async sendReward() {
        return null;
      },
    };
  }

  if (!operatorKey) {
    return {
      enabled: false,
      reason: "missing_operator_key",
      async createRoom() {
        return null;
      },
      async sendReward() {
        return null;
      },
    };
  }

  const account = privateKeyToAccount(operatorKey);
  const chain = getCeloChain(options?.chainId);
  const publicClient = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
  const walletClient = createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
  const artifact = loadWordPotArtifact();
  const contract = getContract({
    address: contractAddress,
    abi: artifact.abi,
    client: {
      public: publicClient,
      wallet: walletClient,
    },
  });

  return {
    enabled: true,
    reason: "ready",
    address: contractAddress,
    account: account.address,
    async getContractBalance() {
      try {
        const balance = await publicClient.getBalance({ address: contractAddress });
        // balance is bigint in wei (18 decimals)
        const WEI = 10n ** 18n;
        const whole = balance / WEI;
        const frac = balance % WEI;
        const asNumber = Number(whole) + Number(frac) / 1e18;
        return `${asNumber.toFixed(4)} CELO`;
      } catch (error) {
        return null;
      }
    },
    async sendReward(toAddress, amountWei) {
      if (!isAddress(toAddress)) {
        throw new Error("Invalid reward wallet address.");
      }

      try {
        console.log("[daily-reward] contract_call_start", {
          toAddress,
          amountWei,
          contractAddress,
        });

        const hash = await contract.write.sendDailyReward([
          toAddress,
          BigInt(amountWei),
        ]);

        console.log("[daily-reward] tx_hash", { hash });
        await publicClient.waitForTransactionReceipt({ hash });
        return hash;
      } catch (error) {
        console.error("[daily-reward] failed:", error.message);
        throw error;
      }
    },
    async createRoom(entryFeeWei) {
      const hash = await contract.write.createRoom([BigInt(entryFeeWei)]);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      let roomId = null;

      for (const log of receipt.logs) {
        if (log.address.toLowerCase() !== contractAddress.toLowerCase())
          continue;

        try {
          const decoded = decodeEventLog({
            abi: artifact.abi,
            data: log.data,
            topics: log.topics,
          });

          if (decoded.eventName === "RoomCreated") {
            roomId = Number(decoded.args.roomId);
            break;
          }
        } catch {
          continue;
        }
      }

      return {
        hash,
        roomId,
      };
    },
    async cancelRoom(contractRoomId, playerAddresses) {
      try {
        console.log("Starting cancelRoom transaction...");
        console.log(`Contract: ${contractAddress}`);
        console.log(`Account: ${account.address}`);
        console.log(`RoomID: ${contractRoomId}`);
        console.log(`Players: ${playerAddresses.length}`);

        const args = [
          BigInt(contractRoomId),
          playerAddresses.map((addr) => String(addr || "").trim()),
        ];
        const gasEstimate = await publicClient.estimateContractGas({
          address: contractAddress,
          abi: artifact.abi,
          functionName: "cancelRoom",
          args,
          account: account.address,
        });
        console.log("Estimated gas for cancelRoom:", gasEstimate.toString());

        const hash = await contract.write.cancelRoom(args);
        console.log("Transaction hash:", hash);

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        console.log("Transaction confirmed:", receipt?.transactionHash);

        if (receipt?.status === "reverted") {
          throw new Error(`Transaction reverted: ${hash}`);
        }

        return { hash, gasEstimate: gasEstimate.toString() };
      } catch (error) {
        console.error("cancelRoom error:", error.message);
        throw error;
      }
    },
    async settleRoom(contractRoomId, playerAddresses, playerScores) {
      const hash = await contract.write.settleRoom([
        BigInt(contractRoomId),
        playerAddresses.map((addr) => String(addr || "").trim()),
        playerScores.map((score) => BigInt(score)),
      ]);
      await publicClient.waitForTransactionReceipt({ hash });
      return { hash };
    },
  };
}

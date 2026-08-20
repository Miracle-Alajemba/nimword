import { useEffect, useState, useCallback } from "react";
import { getInjectedWalletProvider, isMiniPayEnvironment } from "../utils/minipay.js";
import { CELO_MAINNET_CHAIN_ID } from "../config/app-config.js";

/**
 * Dedicated MiniPay Hook for Celo Mainnet Integration.
 * Detects Opera MiniPay webview environment, handles seamless 1-click authentication,
 * and manages Celo transactions via the MiniPay injected provider.
 */
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const active = isMiniPayEnvironment();
    setIsMiniPay(active);

    if (active) {
      const provider = getInjectedWalletProvider();
      if (provider?.request) {
        provider
          .request({ method: "eth_accounts" })
          .then((accounts) => {
            if (accounts?.[0]) {
              setAddress(accounts[0]);
              setStatus("connected");
            }
          })
          .catch(() => {});
      }
    }
  }, []);

  const connectMiniPay = useCallback(async () => {
    const provider = getInjectedWalletProvider();
    if (!provider?.request) {
      throw new Error("MiniPay provider not detected in this environment.");
    }

    setStatus("connecting");
    try {
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      const wallet = accounts?.[0] || "";
      setAddress(wallet);
      setStatus("connected");
      return wallet;
    } catch (err) {
      setStatus("error");
      throw err;
    }
  }, []);

  const sendTransaction = useCallback(async ({ to, value, data = "0x" }) => {
    const provider = getInjectedWalletProvider();
    if (!provider?.request) {
      throw new Error("MiniPay provider not available.");
    }

    // Ensure connection to Celo Mainnet
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${CELO_MAINNET_CHAIN_ID.toString(16)}` }],
      });
    } catch (err) {
      // ignore if already on chain or unsupported switch
    }

    const txHash = await provider.request({
      method: "eth_sendTransaction",
      params: [
        {
          from: address,
          to,
          value: `0x${BigInt(value).toString(16)}`,
          data,
        },
      ],
    });

    return txHash;
  }, [address]);

  return {
    isMiniPay,
    address,
    status,
    connectMiniPay,
    sendTransaction,
  };
}

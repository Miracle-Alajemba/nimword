import { useEffect, useMemo, useState } from "react";
import {
  useAppKit,
  useAppKitAccount,
  useAppKitProvider,
} from "@reown/appkit/react";
import {
  NIM_MAINNET_CHAIN_ID,
  REOWN_PROJECT_ID,
  WALLET_STORAGE_KEY,
} from "../config/app-config.js";
import { useDisconnect } from "wagmi";
import {
  createNimiqPublicClient,
  createInjectedWalletClient,
  createWalletClientFromProvider,
  getInjectedWalletProvider,
} from "../utils/minipay.js";
import { isWalletAddress, shortenWalletAddress } from "../utils/ui-helpers.js";

function parseChainId(value) {
  if (!value) return null;
  if (typeof value === "number") return value;
  try {
    return Number(BigInt(value));
  } catch {
    return Number(value) || null;
  }
}

function toHexChainId(chainId) {
  return `0x${Number(chainId).toString(16)}`;
}

async function ensureNimiqMainnet(provider, chainId = NIM_MAINNET_CHAIN_ID) {
  const targetChainId = toHexChainId(chainId);
  const currentChainId = await provider.request({ method: "eth_chainId" });

  if (String(currentChainId).toLowerCase() === targetChainId.toLowerCase()) {
    return;
  }

  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: targetChainId }],
    });
  } catch (error) {
    if (error?.code !== 4902) {
      throw error;
    }

    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: targetChainId,
        chainName: "Nimiq Mainnet",
        nativeCurrency: { name: "NIM", symbol: "NIM", decimals: 18 },
        rpcUrls: ["https://forno.nimiq.org"],
        blockExplorerUrls: ["https://nimiqwatch.com"],
      }],
    });
  }
}

function getWalletProviderName(provider) {
  if (!provider) return "No wallet";
  if (provider.isNimiq Pay) return "Nimiq Pay";
  if (provider.isMetaMask) return "MetaMask";
  return "Injected wallet";
}

function getNetworkLabel(chainId) {
  const normalized = parseChainId(chainId);
  if (!normalized) return "Unknown network";
  if (normalized === NIM_MAINNET_CHAIN_ID) return "Nimiq Mainnet";
  if (normalized === 11142220) return "Nimiq Sepolia";
  return `Chain ${normalized}`;
}

export function useWalletSession() {
  const [walletAddress, setWalletAddress] = useState("");
  const [walletStatus, setWalletStatus] = useState("");
  const [walletChainId, setWalletChainId] = useState(null);
  const { open } = useAppKit();
  const { disconnect } = useDisconnect();
  const { address: appKitAddress, isConnected: appKitConnected } = useAppKitAccount({
    namespace: "eip155",
  });
  const { walletProvider: appKitProvider } = useAppKitProvider("eip155");
  const injectedProvider = useMemo(() => getInjectedWalletProvider(), []);
  const provider = injectedProvider?.request ? injectedProvider : appKitProvider || null;
  const isNimiq Pay = Boolean(injectedProvider?.isNimiq Pay);
  const hasInjectedProvider = Boolean(injectedProvider?.request);
  const hasWalletConnect = Boolean(REOWN_PROJECT_ID);

  const walletProviderName = useMemo(
    () => getWalletProviderName(provider),
    [provider],
  );
  const walletNetworkLabel = useMemo(
    () => getNetworkLabel(walletChainId),
    [walletChainId],
  );
  const walletReady = Boolean(walletAddress) && parseChainId(walletChainId) === NIM_MAINNET_CHAIN_ID;

  useEffect(() => {
    const storedWallet =
      typeof window !== "undefined"
        ? window.localStorage.getItem(WALLET_STORAGE_KEY) || ""
        : "";

    if (isWalletAddress(storedWallet)) {
      setWalletAddress(storedWallet);
      setWalletStatus("Using previously connected wallet.");
    }

    injectedProvider?.request?.({ method: "eth_chainId" })
      .then((chainId) => setWalletChainId(parseChainId(chainId)))
      .catch(() => {});

    injectedProvider?.request?.({ method: "eth_accounts" })
      .then((accounts) => {
        const nextWallet = accounts?.[0] || "";
        if (!isWalletAddress(nextWallet)) return;
        setWalletAddress(nextWallet);
        window.localStorage.setItem(WALLET_STORAGE_KEY, nextWallet);
        setWalletStatus(
          injectedProvider?.isNimiq Pay
            ? `Nimiq Pay is available as ${shortenWalletAddress(nextWallet)}.`
            : "Using previously connected wallet.",
        );
      })
      .catch(() => {});

    if (!injectedProvider?.on) return undefined;

    function handleAccountsChanged(accounts) {
      const nextWallet = accounts?.[0] || "";
      if (isWalletAddress(nextWallet)) {
        setWalletAddress(nextWallet);
        setWalletStatus("Wallet changed.");
        window.localStorage.setItem(WALLET_STORAGE_KEY, nextWallet);
      } else {
        setWalletAddress("");
        setWalletStatus("Wallet disconnected.");
        window.localStorage.removeItem(WALLET_STORAGE_KEY);
      }
    }

    function handleChainChanged(chainId) {
      const normalized = parseChainId(chainId);
      setWalletChainId(normalized);
      setWalletStatus(normalized === NIM_MAINNET_CHAIN_ID ? "Wallet ready on Nimiq Mainnet." : `Connected on ${getNetworkLabel(normalized)}.`);
    }

    injectedProvider.on("accountsChanged", handleAccountsChanged);
    injectedProvider.on("chainChanged", handleChainChanged);

    return () => {
      if (injectedProvider.removeListener) {
        injectedProvider.removeListener("accountsChanged", handleAccountsChanged);
        injectedProvider.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [injectedProvider]);

  useEffect(() => {
    if (!appKitConnected || !appKitProvider || !isWalletAddress(appKitAddress)) {
      return;
    }

    setWalletAddress(appKitAddress);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WALLET_STORAGE_KEY, appKitAddress);
    }

    appKitProvider
      ?.request?.({ method: "eth_chainId" })
      .then((chainId) => {
        const normalizedChainId = parseChainId(chainId);
        setWalletChainId(normalizedChainId);
        setWalletStatus(
          normalizedChainId === NIM_MAINNET_CHAIN_ID
            ? `Wallet ready on Nimiq Mainnet as ${shortenWalletAddress(appKitAddress)}.`
            : `Wallet connected as ${shortenWalletAddress(appKitAddress)}. Switch to Nimiq Mainnet to continue.`,
        );
      })
      .catch(() => {
        setWalletStatus(`Wallet connected as ${shortenWalletAddress(appKitAddress)}.`);
      });
  }, [appKitAddress, appKitConnected, appKitProvider]);

  async function connectWithAppKitProvider() {
    if (!appKitProvider?.request || !isWalletAddress(appKitAddress)) {
      throw new Error("WalletConnect finished without a usable wallet session.");
    }

    setWalletStatus("Wallet connected. Preparing Nimiq Mainnet...");
    await ensureNimiqMainnet(appKitProvider, NIM_MAINNET_CHAIN_ID);
    const chainId = await appKitProvider.request({ method: "eth_chainId" });
    const normalizedChainId = parseChainId(chainId);

    setWalletAddress(appKitAddress);
    setWalletChainId(normalizedChainId);
    setWalletStatus(`Ready on Nimiq Mainnet as ${shortenWalletAddress(appKitAddress)}`);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(WALLET_STORAGE_KEY, appKitAddress);
    }
  }

  async function connectWallet() {
    const provider = getInjectedWalletProvider();

    if (!provider?.request) {
      try {
        if (appKitConnected && appKitProvider?.request && isWalletAddress(appKitAddress)) {
          await connectWithAppKitProvider();
          return;
        }

        setWalletStatus("Opening wallet options...");
        await open({ view: "Connect" });
        setWalletStatus("Choose a wallet to continue.");
      } catch (error) {
        setWalletStatus(error.message || "Unable to open wallet connection.");
      }
      return;
    }

    try {
      setWalletStatus(provider.isNimiq Pay ? "Requesting Nimiq Pay connection..." : "Requesting wallet connection...");
      const accounts = await provider.request({
        method: "eth_requestAccounts",
      });
      const walletClient = createInjectedWalletClient(NIM_MAINNET_CHAIN_ID);
      const clientAddresses = walletClient ? await walletClient.getAddresses() : [];
      const nextWallet = clientAddresses?.[0] || accounts?.[0] || "";

      if (!isWalletAddress(nextWallet)) {
        throw new Error("Connected account is not a valid wallet address.");
      }

      setWalletStatus(provider.isNimiq Pay ? "Nimiq Pay connected. Preparing Nimiq Mainnet..." : "Wallet connected. Preparing Nimiq Mainnet...");
      await ensureNimiqMainnet(provider, NIM_MAINNET_CHAIN_ID);
      const chainId = await provider.request({ method: "eth_chainId" });

      setWalletAddress(nextWallet);
      setWalletChainId(parseChainId(chainId));
      setWalletStatus(
        provider.isNimiq Pay
          ? `Nimiq Pay ready on Nimiq Mainnet as ${shortenWalletAddress(nextWallet)}`
          : `Ready on Nimiq Mainnet as ${shortenWalletAddress(nextWallet)}`,
      );
      window.localStorage.setItem(WALLET_STORAGE_KEY, nextWallet);
    } catch (error) {
      setWalletStatus(error.message || "Unable to connect wallet.");
    }
  }

  async function disconnectWallet() {
    try {
      await disconnect();
    } catch {}
    setWalletAddress("");
    setWalletChainId(null);
    setWalletStatus("Wallet disconnected locally.");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }

  function clearWalletSession() {
    setWalletAddress("");
    setWalletChainId(null);
    setWalletStatus("Session cleared.");
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(WALLET_STORAGE_KEY);
    }
  }

  return {
    walletAddress,
    walletStatus,
    walletChainId,
    hasInjectedProvider,
    hasWalletConnect,
    isNimiq Pay,
    walletProviderName,
    walletNetworkLabel,
    walletReady,
    connectWallet,
    disconnectWallet,
    clearWalletSession,
    ensureNimiqMainnet,
    parseChainId,
    getInjectedProvider: () => provider,
    getWalletClient: (chainId = NIM_MAINNET_CHAIN_ID) =>
      provider?.request
        ? createWalletClientFromProvider(provider, chainId)
        : createInjectedWalletClient(chainId),
    getPublicClient: createNimiqPublicClient,
    setWalletStatus,
  };
}

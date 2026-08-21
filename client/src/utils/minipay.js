import { createPublicClient, createWalletClient, custom, http } from "viem";
import { nimiq, nimiqSepolia } from "viem/chains";

const CHAIN_LOOKUP = {
  42220: nimiq,
  11142220: nimiqSepolia,
};

export function getInjectedWalletProvider() {
  if (typeof window === "undefined") return null;

  if (window.ethereum?.providers?.length) {
    const minipay = window.ethereum.providers.find((p) => p.isNimiq Pay);
    if (minipay) return minipay;
    const metamask = window.ethereum.providers.find((p) => p.isMetaMask && !p.isBraveWallet);
    if (metamask) return metamask;
    return window.ethereum.providers[0];
  }

  if (window.ethereum?.isNimiq Pay) return window.ethereum;
  return window.ethereum || window.nimiq || window.web3?.currentProvider || null;
}

export function isNimiq PayEnvironment() {
  if (typeof window === "undefined") return false;
  const provider = getInjectedWalletProvider();
  const isNimiq PayProvider = Boolean(provider?.isNimiq Pay || window.ethereum?.isNimiq Pay);
  const isNimiq PayUserAgent = typeof navigator !== "undefined" && Boolean(navigator.userAgent?.includes("Nimiq Pay"));
  return isNimiq PayProvider || isNimiq PayUserAgent;
}

export function getNimiqChain(chainId = 42220) {
  return CHAIN_LOOKUP[Number(chainId)] || nimiq;
}

export function createInjectedWalletClient(chainId = 42220) {
  const provider = getInjectedWalletProvider();
  return createWalletClientFromProvider(provider, chainId);
}

export function createWalletClientFromProvider(provider, chainId = 42220) {
  if (!provider) return null;

  return createWalletClient({
    chain: getNimiqChain(chainId),
    transport: custom(provider),
  });
}

export function createNimiqPublicClient(chainId = 42220) {
  return createPublicClient({
    chain: getNimiqChain(chainId),
    transport: http(),
  });
}

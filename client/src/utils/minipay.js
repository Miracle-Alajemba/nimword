import { createPublicClient, createWalletClient, custom, http } from "viem";
import { celo, celoSepolia } from "viem/chains";

const CHAIN_LOOKUP = {
  42220: celo,
  11142220: celoSepolia,
};

export function getInjectedWalletProvider() {
  if (typeof window === "undefined") return null;

  if (window.ethereum?.providers?.length) {
    const minipay = window.ethereum.providers.find((p) => p.isMiniPay);
    if (minipay) return minipay;
    const metamask = window.ethereum.providers.find((p) => p.isMetaMask && !p.isBraveWallet);
    if (metamask) return metamask;
    return window.ethereum.providers[0];
  }

  if (window.ethereum?.isMiniPay) return window.ethereum;
  return window.ethereum || window.celo || window.web3?.currentProvider || null;
}

export function isMiniPayEnvironment() {
  if (typeof window === "undefined") return false;
  const provider = getInjectedWalletProvider();
  const isMiniPayProvider = Boolean(provider?.isMiniPay || window.ethereum?.isMiniPay);
  const isMiniPayUserAgent = typeof navigator !== "undefined" && Boolean(navigator.userAgent?.includes("MiniPay"));
  return isMiniPayProvider || isMiniPayUserAgent;
}

export function getCeloChain(chainId = 42220) {
  return CHAIN_LOOKUP[Number(chainId)] || celo;
}

export function createInjectedWalletClient(chainId = 42220) {
  const provider = getInjectedWalletProvider();
  return createWalletClientFromProvider(provider, chainId);
}

export function createWalletClientFromProvider(provider, chainId = 42220) {
  if (!provider) return null;

  return createWalletClient({
    chain: getCeloChain(chainId),
    transport: custom(provider),
  });
}

export function createCeloPublicClient(chainId = 42220) {
  return createPublicClient({
    chain: getCeloChain(chainId),
    transport: http(),
  });
}

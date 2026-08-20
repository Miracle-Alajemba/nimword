export function hasInjectedWeb3() {
  return typeof window !== "undefined" && Boolean(window.ethereum || window.celo);
}

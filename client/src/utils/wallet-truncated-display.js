export function formatWalletDisplay(address = "") {
  if (!address || address.length < 10) return "Not Connected";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

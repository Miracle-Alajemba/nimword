export function formatNimiqBalanceShort(balanceWei = 0) {
  const nimiq = Number(balanceWei) / 1e18;
  if (nimiq >= 1000) return (nimiq / 1000).toFixed(1) + "k NIM";
  return nimiq.toFixed(2) + " NIM";
}

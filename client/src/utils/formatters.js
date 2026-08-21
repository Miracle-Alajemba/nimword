export function formatNimiq(weiAmount = 0) {
  const nimiq = Number(weiAmount) / 1e18;
  return nimiq.toFixed(4) + " NIM";
}

export async function isLowPowerMode() {
  if (typeof navigator !== "undefined" && navigator.getBattery) {
    try {
      const b = await navigator.getBattery();
      return b.level <= 0.2 && !b.charging;
    } catch (e) {}
  }
  return false;
}

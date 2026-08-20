export function getMultiplierByLength(len = 3) {
  if (len >= 8) return 3.0;
  if (len >= 6) return 2.0;
  if (len >= 4) return 1.5;
  return 1.0;
}

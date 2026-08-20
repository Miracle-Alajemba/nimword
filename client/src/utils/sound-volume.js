export function scaleVolume(setting = 100) {
  return Math.max(0, Math.min(1, setting / 100));
}

export function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((v) => v / 255);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

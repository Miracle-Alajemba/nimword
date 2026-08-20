export function shouldCompressPayload(bytes = 0, threshold = 1024) {
  return bytes >= threshold;
}

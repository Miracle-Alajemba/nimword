export function isMiniPayUserAgent(ua = "") {
  return /minipay/i.test(ua);
}

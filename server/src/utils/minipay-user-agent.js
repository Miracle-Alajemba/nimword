export function isNimiqPayUserAgent(ua = "") {
  return /nimiqpay|minipay/i.test(ua);
}

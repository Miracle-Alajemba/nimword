export const CUSTOM_BLOCKED_WORDS = ["scam", "phishing", "exploit"];
export function containsCustomBlocked(text = "") {
  const lower = text.toLowerCase();
  return CUSTOM_BLOCKED_WORDS.some((w) => lower.includes(w));
}

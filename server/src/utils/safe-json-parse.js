export function safeJsonParse(jsonStr = "", fallback = null) {
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    return fallback;
  }
}

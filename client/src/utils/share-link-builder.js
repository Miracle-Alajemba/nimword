export function buildShareUrl(roomId = "") {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://wordpot.app";
  return `${baseUrl}?room=${encodeURIComponent(roomId)}`;
}

export function buildShareUrl(roomId = "") {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://nimword.app";
  return `${baseUrl}?room=${encodeURIComponent(roomId)}`;
}

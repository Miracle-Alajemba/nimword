export function preloadAudio(src = "") {
  if (typeof Audio !== "undefined" && src) {
    const audio = new Audio(src);
    audio.preload = "auto";
    return audio;
  }
  return null;
}

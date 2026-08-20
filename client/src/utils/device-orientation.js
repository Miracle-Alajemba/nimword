export function getOrientation() {
  if (typeof window !== "undefined" && window.screen?.orientation) {
    return window.screen.orientation.type.includes("portrait") ? "portrait" : "landscape";
  }
  return "portrait";
}

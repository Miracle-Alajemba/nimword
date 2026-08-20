export function triggerHaptic(pattern = [50]) {
  if (typeof window !== "undefined" && window.navigator?.vibrate) {
    window.navigator.vibrate(pattern);
  }
}

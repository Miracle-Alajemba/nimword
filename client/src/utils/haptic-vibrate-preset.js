export function triggerButtonVibration() {
  if (typeof window !== "undefined" && window.navigator?.vibrate) {
    window.navigator.vibrate(30);
  }
}

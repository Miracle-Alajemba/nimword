export function vibrateShort() {
  if (typeof window !== "undefined" && window.navigator?.vibrate) {
    window.navigator.vibrate(40);
  }
}

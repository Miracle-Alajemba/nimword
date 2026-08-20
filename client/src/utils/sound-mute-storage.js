export function saveMuteState(muted = false) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("wordpot_muted", String(muted));
  }
}

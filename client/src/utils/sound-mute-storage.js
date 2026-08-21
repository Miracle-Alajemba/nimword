export function saveMuteState(muted = false) {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("nimword_muted", String(muted));
  }
}

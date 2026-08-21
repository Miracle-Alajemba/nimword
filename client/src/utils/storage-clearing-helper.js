export function clearGameCache() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("nimword_draft_word");
    localStorage.removeItem("nimword_recent_room");
  }
}

export function clearGameCache() {
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem("wordpot_draft_word");
    localStorage.removeItem("wordpot_recent_room");
  }
}

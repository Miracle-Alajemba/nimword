export function filterChatMessage(message = "") {
  return message.replace(/\b(badword|spam|scam)\b/gi, "***");
}

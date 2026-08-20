export function selectBotWord(words = [], difficulty = "medium") {
  if (!words.length) return "";
  if (difficulty === "hard") return words[words.length - 1];
  if (difficulty === "easy") return words[0];
  return words[Math.floor(words.length / 2)];
}

export function getLevelTitle(level = 1) {
  if (level >= 50) return "Grandmaster Lexicon";
  if (level >= 30) return "Word Titan";
  if (level >= 20) return "Master Wordsmith";
  if (level >= 10) return "Spelling Veteran";
  return "Word Apprentice";
}

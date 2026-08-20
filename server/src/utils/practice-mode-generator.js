export function generatePracticeRoundSeed(difficulty = "medium") {
  const words = { easy: "CAT", medium: "WORDPOT", hard: "BLOCKCHAIN" };
  return { sourceWord: words[difficulty] || "WORDPOT", targetScore: difficulty === "hard" ? 80 : 40 };
}

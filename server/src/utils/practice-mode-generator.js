export function generatePracticeRoundSeed(difficulty = "medium") {
  const words = { easy: "CAT", medium: "NIMWORD", hard: "BLOCKCHAIN" };
  return { sourceWord: words[difficulty] || "NIMWORD", targetScore: difficulty === "hard" ? 80 : 40 };
}

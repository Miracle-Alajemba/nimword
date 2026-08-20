export function getDailyDifficultyConfig(difficulty = "medium") {
  const table = {
    easy: { targetScore: 40, rewardCelo: "0.05 CELO" },
    medium: { targetScore: 60, rewardCelo: "1 CELO" },
    hard: { targetScore: 80, rewardCelo: "2 CELO" },
  };
  return table[difficulty] || table.medium;
}

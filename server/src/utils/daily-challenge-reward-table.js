export function getDailyDifficultyConfig(difficulty = "medium") {
  const table = {
    easy: { targetScore: 40, rewardNimiq: "0.1 NIM" },
    medium: { targetScore: 60, rewardNimiq: "1 NIM" },
    hard: { targetScore: 80, rewardNimiq: "2 NIM" },
  };
  return table[difficulty] || table.medium;
}

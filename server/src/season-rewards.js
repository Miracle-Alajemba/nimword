/**
 * Season Leaderboard Bonus Payout Calculator for WordPot.
 */

/**
 * Calculate weekly bonus distribution for top leaderboard players.
 * @param {Array<{ address: string, score: number }>} leaderboardEntries - Sorted leaderboard entries
 * @param {number} totalBonusCELO - Total bonus prize pool in CELO (e.g. 1.75 CELO)
 * @returns {{ payouts: Array<{ rank: number, address: string, amount: number }>, totalDistributed: number }}
 */
export function calculateWeeklySeasonBonus(leaderboardEntries, totalBonusCELO = 1.75) {
  if (!Array.isArray(leaderboardEntries) || leaderboardEntries.length === 0 || totalBonusCELO <= 0) {
    return { payouts: [], totalDistributed: 0 };
  }

  // Exact 4:2:1 ratio (4/7 for 1st, 2/7 for 2nd, 1/7 for 3rd)
  const shares = [4 / 7, 2 / 7, 1 / 7];
  const topPlayers = leaderboardEntries.slice(0, 3);
  let totalDistributed = 0;

  const payouts = topPlayers.map((player, index) => {
    const amount = Number((totalBonusCELO * shares[index]).toFixed(4));
    totalDistributed += amount;
    return {
      rank: index + 1,
      address: player.address,
      amount,
    };
  });

  return {
    payouts,
    totalDistributed: Number(totalDistributed.toFixed(4)),
  };
}

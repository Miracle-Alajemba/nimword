/**
 * Season Leaderboard Bonus Payout Calculator for NimWord.
 */

/**
 * Calculate weekly bonus distribution for top leaderboard players.
 * @param {Array<{ address: string, score: number }>} leaderboardEntries - Sorted leaderboard entries
 * @param {number} totalBonusNIM - Total bonus prize pool in NIM (e.g. 1.75 NIM)
 * @returns {{ payouts: Array<{ rank: number, address: string, amount: number }>, totalDistributed: number }}
 */
export function calculateWeeklySeasonBonus(leaderboardEntries, totalBonusNIM = 1.75) {
  if (!Array.isArray(leaderboardEntries) || leaderboardEntries.length === 0 || totalBonusNIM <= 0) {
    return { payouts: [], totalDistributed: 0 };
  }

  // Exact 4:2:1 ratio (4/7 for 1st, 2/7 for 2nd, 1/7 for 3rd)
  const shares = [4 / 7, 2 / 7, 1 / 7];
  const topPlayers = leaderboardEntries.slice(0, 3);
  let totalDistributed = 0;

  const payouts = topPlayers.map((player, index) => {
    const amount = Number((totalBonusNIM * shares[index]).toFixed(4));
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

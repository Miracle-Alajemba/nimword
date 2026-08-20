export function getLeaderboardPageSlice(leaderboard = [], page = 1, pageSize = 20) {
  const offset = (page - 1) * pageSize;
  return {
    items: leaderboard.slice(offset, offset + pageSize),
    page,
    totalPages: Math.ceil(leaderboard.length / pageSize) || 1,
  };
}

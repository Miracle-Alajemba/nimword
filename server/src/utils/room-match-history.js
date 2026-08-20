export function formatMatchHistoryRecord(roomId, winner, score) {
  return {
    roomId,
    winner,
    score,
    timestamp: new Date().toISOString(),
  };
}

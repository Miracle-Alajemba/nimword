export function buildOpenGraphCardData(score = 0, roomCode = "") {
  return {
    title: `Join NimWord Arena Match ${roomCode}`,
    description: `I just scored ${score} pts on Nimiq Mainnet! Tap to play.`,
  };
}

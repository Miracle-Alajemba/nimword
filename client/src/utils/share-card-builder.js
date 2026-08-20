export function buildOpenGraphCardData(score = 0, roomCode = "") {
  return {
    title: `Join WordPot Arena Match ${roomCode}`,
    description: `I just scored ${score} pts on Celo Mainnet! Tap to play.`,
  };
}

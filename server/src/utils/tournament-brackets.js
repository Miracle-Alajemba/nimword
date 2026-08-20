export function generateBracketPairs(players = []) {
  const pairs = [];
  for (let i = 0; i < players.length; i += 2) {
    pairs.push([players[i], players[i + 1] || null]);
  }
  return pairs;
}

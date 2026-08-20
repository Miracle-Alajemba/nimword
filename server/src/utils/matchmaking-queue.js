export function findMatchInQueue(queue = [], playerRating = 1000, maxDiff = 200) {
  return queue.find((p) => Math.abs(p.rating - playerRating) <= maxDiff) || null;
}

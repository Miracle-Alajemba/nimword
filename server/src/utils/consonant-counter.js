export function countConsonants(word = "") {
  const match = word.match(/[bcdfghjklmnpqrstvwxyz]/gi);
  return match ? match.length : 0;
}

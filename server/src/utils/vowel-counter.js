export function countVowels(word = "") {
  const match = word.match(/[aeiou]/gi);
  return match ? match.length : 0;
}

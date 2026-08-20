export function drawWeightedLetter() {
  const vowels = "AEIOU";
  const consonants = "BCDFGHJKLMNPQRSTVWXYZ";
  return Math.random() < 0.4 ? vowels[Math.floor(Math.random() * vowels.length)] : consonants[Math.floor(Math.random() * consonants.length)];
}

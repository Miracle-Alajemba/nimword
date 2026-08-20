export function cleanWordInput(word = "") {
  return word.trim().toUpperCase().replace(/[^A-Z]/g, "");
}

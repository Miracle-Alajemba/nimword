export function mapKeyCodeToLetter(code = "") {
  if (code.startsWith("Key")) return code.slice(3).toUpperCase();
  return "";
}

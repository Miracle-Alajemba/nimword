export function sanitizeUsername(name = "") {
  return name.replace(/<[^>]*>/g, "").replace(/[^a-zA-Z0-9_ -]/g, "").trim().slice(0, 20);
}

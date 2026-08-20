export function escapeSearchQuery(query = "") {
  return query.replace(/[%_\\]/g, "\\$&").trim();
}

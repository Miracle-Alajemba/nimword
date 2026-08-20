export function getQueryParam(key = "", searchStr = "") {
  if (typeof window === "undefined" && !searchStr) return null;
  const params = new URLSearchParams(searchStr || window.location.search);
  return params.get(key);
}

export function updatePageTitle(title = "NimWord Arena") {
  if (typeof document !== "undefined") {
    document.title = title;
  }
}

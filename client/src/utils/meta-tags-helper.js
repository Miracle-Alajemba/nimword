export function updatePageTitle(title = "WordPot Arena") {
  if (typeof document !== "undefined") {
    document.title = title;
  }
}

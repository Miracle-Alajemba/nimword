export function getSavedTheme(defaultTheme = "dark") {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("wordpot_theme") || defaultTheme;
  }
  return defaultTheme;
}

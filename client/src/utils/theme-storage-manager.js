export function getSavedTheme(defaultTheme = "dark") {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("nimword_theme") || defaultTheme;
  }
  return defaultTheme;
}

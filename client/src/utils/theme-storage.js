export function saveThemePreference(theme = "dark") {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("wordpot_theme", theme);
  }
}

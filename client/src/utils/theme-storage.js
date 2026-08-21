export function saveThemePreference(theme = "dark") {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("nimword_theme", theme);
  }
}

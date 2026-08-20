/**
 * Theme Tokens & Color Palette Utility
 */

export const THEME_TOKENS = {
  colors: {
    primary: "#10b981", // Emerald-500
    secondary: "#06b6d4", // Cyan-500
    accent: "#f59e0b", // Amber-500
    danger: "#f43f5e", // Rose-500
    background: "#0f172a", // Slate-900
  },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
};

/**
 * Returns Hex color code for a given tier string.
 * @param {"primary"|"secondary"|"accent"|"danger"} tier
 * @returns {string}
 */
export function getThemeColor(tier) {
  return THEME_TOKENS.colors[tier] || THEME_TOKENS.colors.primary;
}

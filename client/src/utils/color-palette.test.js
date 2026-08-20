import { THEME_COLORS } from "./color-palette.js";
describe("Color Palette Constants", () => {
  test("exports valid hex codes", () => {
    expect(THEME_COLORS.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
  });
});

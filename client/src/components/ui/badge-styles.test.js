import { BADGE_VARIANTS } from "./badge-styles.js";
describe("Badge Styles", () => {
  test("contains valid variant class names", () => {
    expect(BADGE_VARIANTS.success).toContain("emerald");
  });
});

import { staggerDelay, springTransition, slideTransform } from "../utils/animation.js";

describe("animation utils", () => {
  test("staggerDelay computes ms offset", () => {
    expect(staggerDelay(2, 50)).toBe("100ms");
  });

  test("springTransition returns transition string", () => {
    expect(springTransition(300, "smooth")).toContain("300ms");
  });

  test("slideTransform returns CSS transform", () => {
    expect(slideTransform("up", 20, false)).toBe("translate(0, 20px)");
    expect(slideTransform("up", 20, true)).toBe("translate(0, 0)");
  });
});

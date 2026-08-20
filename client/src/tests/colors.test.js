import { stringToColor, rankColor, scoreColor } from "../utils/colors.js";

describe("colors utils", () => {
  test("stringToColor returns HSL string", () => {
    expect(stringToColor("player1")).toContain("hsl(");
  });

  test("rankColor returns medal colors for top 3", () => {
    expect(rankColor(1)).toBe("#ffd700");
    expect(rankColor(2)).toBe("#c0c0c0");
    expect(rankColor(3)).toBe("#cd7f32");
  });

  test("scoreColor returns proper tier colors", () => {
    expect(scoreColor(15)).toBe("#63f4ca");
    expect(scoreColor(8)).toBe("#ffad33");
  });
});

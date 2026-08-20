import { compactNumber, formatScoreChange, ordinal } from "../utils/numbers.js";

describe("numbers utils", () => {
  test("compactNumber formats numbers", () => {
    expect(compactNumber(1500)).toBe("1.5K");
    expect(compactNumber(500)).toBe("500");
  });

  test("formatScoreChange appends plus sign", () => {
    expect(formatScoreChange(12)).toBe("+12");
    expect(formatScoreChange(0)).toBe("0");
  });

  test("ordinal appends proper suffix", () => {
    expect(ordinal(1)).toBe("1st");
    expect(ordinal(2)).toBe("2nd");
    expect(ordinal(3)).toBe("3rd");
    expect(ordinal(4)).toBe("4th");
  });
});

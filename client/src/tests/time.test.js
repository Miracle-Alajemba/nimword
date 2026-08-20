import { formatTimer, timeAgo, formatDuration } from "../utils/time.js";

describe("time utils", () => {
  test("formatTimer formats seconds to MM:SS", () => {
    expect(formatTimer(65)).toBe("01:05");
    expect(formatTimer(0)).toBe("00:00");
  });

  test("formatDuration formats to m s", () => {
    expect(formatDuration(83)).toBe("1m 23s");
    expect(formatDuration(45)).toBe("45s");
  });

  test("timeAgo handles recent time", () => {
    expect(timeAgo(Date.now() - 5000)).toBe("just now");
  });
});

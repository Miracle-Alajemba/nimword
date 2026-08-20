import test, { describe, it } from "node:test";
import assert from "node:assert";
import { formatCountdownTime, formatRelativeTime } from "./time-formatter.js";

describe("Time Formatter Utility", () => {
  it("should format countdown seconds into MM:SS string", () => {
    assert.strictEqual(formatCountdownTime(125), "02:05");
    assert.strictEqual(formatCountdownTime(0), "00:00");
  });

  it("should format relative time string", () => {
    const now = new Date().toISOString();
    assert.strictEqual(formatRelativeTime(now), "just now");
  });
});

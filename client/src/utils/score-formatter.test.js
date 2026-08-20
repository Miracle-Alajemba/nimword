import test, { describe, it } from "node:test";
import assert from "node:assert";
import { formatScoreCompact, formatRankOrdinal } from "./score-formatter.js";

describe("Score Formatter Utility", () => {
  it("should format score numbers into compact notation", () => {
    assert.strictEqual(formatScoreCompact(500), "500");
    assert.strictEqual(formatScoreCompact(1250), "1.3k");
    assert.strictEqual(formatScoreCompact(25000), "25k");
    assert.strictEqual(formatScoreCompact(1500000), "1.5M");
  });

  it("should format ranks into ordinal strings", () => {
    assert.strictEqual(formatRankOrdinal(1), "1st");
    assert.strictEqual(formatRankOrdinal(2), "2nd");
    assert.strictEqual(formatRankOrdinal(3), "3rd");
    assert.strictEqual(formatRankOrdinal(4), "4th");
    assert.strictEqual(formatRankOrdinal(21), "21st");
  });
});

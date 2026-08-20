import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("ScoreMultiplierTag Component Module", () => {
  it("should export valid component function", async () => {
    const { ScoreMultiplierTag } = await import("./score-multiplier-tag.jsx");
    assert.strictEqual(typeof ScoreMultiplierTag, "function");
  });
});

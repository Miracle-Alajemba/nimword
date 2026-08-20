import test, { describe, it } from "node:test";
import assert from "node:assert";
import { getRankTierColors } from "./rank-tier.js";

describe("Rank Tier Utility", () => {
  it("should return gold tier colors for 1st rank", () => {
    const colors = getRankTierColors(1);
    assert.strictEqual(colors.text, "text-amber-300");
  });

  it("should return silver tier colors for 2nd rank", () => {
    const colors = getRankTierColors(2);
    assert.strictEqual(colors.text, "text-slate-200");
  });
});

import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("StreakFlame Component Module", () => {
  it("should export valid component function", async () => {
    const { StreakFlame } = await import("./streak-flame.jsx");
    assert.strictEqual(typeof StreakFlame, "function");
  });
});

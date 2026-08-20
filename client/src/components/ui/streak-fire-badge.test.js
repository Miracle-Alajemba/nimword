import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("StreakFireBadge Component Module", () => {
  it("should export valid component function", async () => {
    const { StreakFireBadge } = await import("./streak-fire-badge.jsx");
    assert.strictEqual(typeof StreakFireBadge, "function");
  });
});

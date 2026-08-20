import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("BadgePill Component Module", () => {
  it("should export valid component function", async () => {
    const { BadgePill } = await import("./badge-pill.jsx");
    assert.strictEqual(typeof BadgePill, "function");
  });
});

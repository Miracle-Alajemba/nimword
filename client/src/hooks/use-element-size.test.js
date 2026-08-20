import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("useElementSize Hook Module", () => {
  it("should export valid hook module function", async () => {
    const { useElementSize } = await import("./use-element-size.js");
    assert.strictEqual(typeof useElementSize, "function");
  });
});

import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("useClickOutside Hook Module", () => {
  it("should export valid hook module function", async () => {
    const { useClickOutside } = await import("./use-click-outside.js");
    assert.strictEqual(typeof useClickOutside, "function");
  });
});

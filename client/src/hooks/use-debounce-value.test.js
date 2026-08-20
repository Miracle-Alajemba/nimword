import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("useDebounceValue Hook Module", () => {
  it("should export valid hook module function", async () => {
    const { useDebounceValue } = await import("./use-debounce-value.js");
    assert.strictEqual(typeof useDebounceValue, "function");
  });
});

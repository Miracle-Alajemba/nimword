import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("useIntervalTimer Hook Module", () => {
  it("should export valid hook module function", async () => {
    const { useIntervalTimer } = await import("./use-interval-timer.js");
    assert.strictEqual(typeof useIntervalTimer, "function");
  });
});

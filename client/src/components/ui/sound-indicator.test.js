import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("SoundIndicator Component Module", () => {
  it("should export valid component function", async () => {
    const { SoundIndicator } = await import("./sound-indicator.jsx");
    assert.strictEqual(typeof SoundIndicator, "function");
  });
});

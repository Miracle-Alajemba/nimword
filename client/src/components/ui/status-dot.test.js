import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("StatusDot Component Module", () => {
  it("should export valid component function", async () => {
    const { StatusDot } = await import("./status-dot.jsx");
    assert.strictEqual(typeof StatusDot, "function");
  });
});

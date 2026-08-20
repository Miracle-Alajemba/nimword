import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("TooltipBox Component Module", () => {
  it("should export valid component function", async () => {
    const { TooltipBox } = await import("./tooltip-box.jsx");
    assert.strictEqual(typeof TooltipBox, "function");
  });
});

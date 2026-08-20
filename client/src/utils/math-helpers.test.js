import test, { describe, it } from "node:test";
import assert from "node:assert";
import { clampValue, getRandomInt } from "./math-helpers.js";

describe("Client Math Helpers Module", () => {
  it("should clamp numeric values within range", () => {
    assert.strictEqual(clampValue(15, 0, 10), 10);
    assert.strictEqual(clampValue(-5, 0, 10), 0);
    assert.strictEqual(clampValue(5, 0, 10), 5);
  });

  it("should return random integer within specified range", () => {
    const val = getRandomInt(1, 5);
    assert.ok(val >= 1 && val <= 5);
  });
});

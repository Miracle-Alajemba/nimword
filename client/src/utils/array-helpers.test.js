import test, { describe, it } from "node:test";
import assert from "node:assert";
import { shuffleArray, getRandomElements } from "./array-helpers.js";

describe("Client Array Helpers Module", () => {
  it("should return a new array with same elements after shuffle", () => {
    const orig = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(orig);
    assert.strictEqual(shuffled.length, orig.length);
    assert.deepStrictEqual(shuffled.sort(), orig.sort());
  });

  it("should pick requested number of random elements", () => {
    const orig = ["a", "b", "c", "d"];
    const picked = getRandomElements(orig, 2);
    assert.strictEqual(picked.length, 2);
  });
});

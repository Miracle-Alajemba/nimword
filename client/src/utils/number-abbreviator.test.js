import test from "node:test";
import assert from "node:assert";
import { abbreviateNumber } from "./number-abbreviator.js";

test("abbreviate numbers with K/M suffixes", () => {
  assert.strictEqual(abbreviateNumber(1500), "1.5K");
  assert.strictEqual(abbreviateNumber(2000000), "2.0M");
});

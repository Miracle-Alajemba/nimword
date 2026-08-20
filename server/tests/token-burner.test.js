import test from "node:test";
import assert from "node:assert";
import { calculateBurnAmount } from "../src/utils/token-burner.js";

test("calculates 5% token burn amount", () => {
  assert.strictEqual(calculateBurnAmount(100, 5), 5);
});

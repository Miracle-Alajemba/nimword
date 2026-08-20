import test from "node:test";
import assert from "node:assert";
import { minutesToMilliseconds } from "../src/utils/time-conversion.js";

test("converts minutes into milliseconds", () => {
  assert.strictEqual(minutesToMilliseconds(5), 300000);
});

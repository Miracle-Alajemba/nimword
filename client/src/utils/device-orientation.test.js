import test from "node:test";
import assert from "node:assert";
import { getOrientation } from "./device-orientation.js";

test("returns device orientation string", () => {
  assert.strictEqual(typeof getOrientation(), "string");
});

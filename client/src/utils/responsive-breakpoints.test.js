import test from "node:test";
import assert from "node:assert";
import { BREAKPOINTS } from "./responsive-breakpoints.js";

test("exports pixel width breakpoints", () => {
  assert.strictEqual(BREAKPOINTS.md, 768);
});

import test from "node:test";
import assert from "node:assert";
import { cn } from "./css-class-joiner.js";

test("filters falsy values and joins class names", () => {
  assert.strictEqual(cn("btn", false, "btn-primary"), "btn btn-primary");
});

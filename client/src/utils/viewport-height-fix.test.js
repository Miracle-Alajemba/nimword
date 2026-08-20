import test from "node:test";
import assert from "node:assert";
import { setDynamicVhProperty } from "./viewport-height-fix.js";

test("sets --vh CSS variable without throwing error", () => {
  assert.doesNotThrow(() => setDynamicVhProperty());
});

import test from "node:test";
import assert from "node:assert";
import { GLASS_SURFACE_CLASSES } from "./ui-glass-styles.js";

test("exports glassmorphism UI surface styling classes", () => {
  assert.strictEqual(GLASS_SURFACE_CLASSES.includes("backdrop-blur-lg"), true);
});

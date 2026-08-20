import test from "node:test";
import assert from "node:assert";
import { GLASS_CARD_CLASSES } from "./card-glassmorphism-style.js";

test("exports glassmorphism card styling classes", () => {
  assert.strictEqual(GLASS_CARD_CLASSES.includes("backdrop-blur"), true);
});

import test from "node:test";
import assert from "node:assert";
import { getAvatarColor } from "./avatar-fallback-generator.js";

test("returns hex color for avatar fallback", () => {
  assert.strictEqual(getAvatarColor("Alice").startsWith("#"), true);
});

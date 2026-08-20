import test from "node:test";
import assert from "node:assert";
import { scaleVolume } from "./sound-volume.js";

test("scales 0-100 percentage to 0-1 decimal", () => {
  assert.strictEqual(scaleVolume(50), 0.5);
  assert.strictEqual(scaleVolume(120), 1.0);
});

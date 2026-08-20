import test from "node:test";
import assert from "node:assert";
import { calculateTileSize } from "./responsive-tile-scaler.js";

test("calculates letter tile width based on container width", () => {
  const size = calculateTileSize(360, 7);
  assert.strictEqual(size >= 36, true);
});

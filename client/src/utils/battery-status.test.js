import test from "node:test";
import assert from "node:assert";
import { isLowPowerMode } from "./battery-status.js";

test("evaluates low power mode safely", async () => {
  const low = await isLowPowerMode();
  assert.strictEqual(typeof low, "boolean");
});

import test from "node:test";
import assert from "node:assert";
import { formatTimerPillDisplay } from "../src/utils/game-timer-formatter.js";

test("formats remaining round seconds into M:SS string", () => {
  assert.strictEqual(formatTimerPillDisplay(60), "1:00");
  assert.strictEqual(formatTimerPillDisplay(5), "0:05");
});

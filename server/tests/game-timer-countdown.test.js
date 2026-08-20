import test from "node:test";
import assert from "node:assert";
import { formatSecondsLeftDisplay } from "../src/utils/game-timer-countdown.js";

test("formats remaining seconds display string", () => {
  assert.strictEqual(formatSecondsLeftDisplay(15), "15s remaining");
  assert.strictEqual(formatSecondsLeftDisplay(0), "TIME UP!");
});

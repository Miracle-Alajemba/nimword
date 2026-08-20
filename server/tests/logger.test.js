import test from "node:test";
import assert from "node:assert";
import { formatLogMessage } from "../src/utils/logger.js";

test("formats log message into valid JSON", () => {
  const log = formatLogMessage("info", "test event", { roomId: 123 });
  const parsed = JSON.parse(log);
  assert.strictEqual(parsed.level, "info");
  assert.strictEqual(parsed.roomId, 123);
});

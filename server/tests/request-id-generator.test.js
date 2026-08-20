import test from "node:test";
import assert from "node:assert";
import { generateRequestId } from "../src/utils/request-id-generator.js";

test("generates req_ prefixed request correlation ID", () => {
  const id = generateRequestId();
  assert.strictEqual(id.startsWith("req_"), true);
});

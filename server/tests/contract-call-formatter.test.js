import test from "node:test";
import assert from "node:assert";
import { formatContractCallLogs } from "../src/utils/contract-call-formatter.js";

test("formats contract call details into string", () => {
  const log = formatContractCallLogs("joinRoom", [42], "0x123");
  assert.strictEqual(log.includes("joinRoom(42)"), true);
});

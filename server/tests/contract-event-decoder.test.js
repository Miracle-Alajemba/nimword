import test from "node:test";
import assert from "node:assert";
import { isSupportedContractEvent } from "../src/utils/contract-event-decoder.js";

test("verifies supported contract log events", () => {
  assert.strictEqual(isSupportedContractEvent("RoomCreated"), true);
  assert.strictEqual(isSupportedContractEvent("UnknownEvent"), false);
});

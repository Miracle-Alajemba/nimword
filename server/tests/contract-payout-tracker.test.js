import test, { describe, it } from "node:test";
import assert from "node:assert";
import { getContractPayoutStats } from "../src/utils/contract-payout-tracker.js";

describe("Contract Payout Tracker Module", () => {
  it("should return valid contract payout statistics object", async () => {
    const stats = await getContractPayoutStats();
    assert.strictEqual(typeof stats.totalPayoutsCelo, "string");
    assert.strictEqual(typeof stats.totalSettledMatches, "number");
    assert.strictEqual(stats.verifiedOnchain, true);
    assert.ok(stats.roomContract.startsWith("0x"));
    assert.ok(stats.dailyContract.startsWith("0x"));
    assert.ok(stats.celoscanRoomUrl.includes("celoscan.io"));
  });
});

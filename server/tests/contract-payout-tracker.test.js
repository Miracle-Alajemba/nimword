import { describe, it } from "node:test";
import assert from "node:assert";
import { getContractPayoutStats } from "../src/utils/contract-payout-tracker.js";

describe("Contract Payout Tracker Module", () => {
  it("should return valid contract payout statistics object", async () => {
    const stats = await getContractPayoutStats();
    assert.strictEqual(typeof stats.totalPayoutsNimiq, "string");
    assert.strictEqual(typeof stats.totalSettledMatches, "number");
    assert.strictEqual(stats.verifiedOnchain, true);
    assert.ok(stats.roomContract.startsWith("NQ"));
    assert.ok(stats.dailyContract.startsWith("NQ"));
    assert.ok(stats.nimiqscanRoomUrl.includes("nimiqwatch.com"));
  });
});

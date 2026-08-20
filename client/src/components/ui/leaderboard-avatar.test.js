import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("LeaderboardAvatar Component Module", () => {
  it("should export valid component function", async () => {
    const { LeaderboardAvatar } = await import("./leaderboard-avatar.jsx");
    assert.strictEqual(typeof LeaderboardAvatar, "function");
  });
});

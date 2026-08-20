import test, { describe, it } from "node:test";
import assert from "node:assert";

describe("PlayerCard Component Module", () => {
  it("should export valid component function", async () => {
    const { PlayerCard } = await import("./player-card.jsx");
    assert.strictEqual(typeof PlayerCard, "function");
  });
});

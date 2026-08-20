import test, { describe, it } from "node:test";
import assert from "node:assert";
import {
  getMemoryUsage,
  formatUptime,
  calculateRoomMetrics,
  calculateActivePlayers,
  buildTelemetryPayload,
} from "../src/utils/telemetry.js";

describe("Telemetry Utility Module", () => {
  it("should return valid memory usage metrics in megabytes", () => {
    const mem = getMemoryUsage();
    assert.strictEqual(typeof mem.heapUsedMb, "number");
    assert.strictEqual(typeof mem.heapTotalMb, "number");
    assert.strictEqual(typeof mem.rssMb, "number");
    assert.ok(mem.heapUsedMb > 0);
  });

  it("should format uptime seconds into human-readable string", () => {
    assert.strictEqual(formatUptime(45), "45s");
    assert.strictEqual(formatUptime(125), "2m 5s");
    assert.strictEqual(formatUptime(3665), "1h 1m 5s");
    assert.strictEqual(formatUptime(90061), "1d 1h 1m 1s");
  });

  it("should calculate correct room status breakdown", () => {
    const mockRooms = [
      { id: "r1", status: "active" },
      { id: "r2", status: "active" },
      { id: "r3", status: "waiting" },
      { id: "r4", status: "finished" },
    ];
    const metrics = calculateRoomMetrics(mockRooms);
    assert.strictEqual(metrics.totalRooms, 4);
    assert.strictEqual(metrics.activeRooms, 2);
    assert.strictEqual(metrics.waitingRooms, 1);
    assert.strictEqual(metrics.finishedRooms, 1);
  });

  it("should count unique active players from rooms list", () => {
    const mockRooms = [
      {
        id: "r1",
        players: [
          { walletAddress: "0x1111111111111111111111111111111111111111" },
          { walletAddress: "0x2222222222222222222222222222222222222222" },
        ],
      },
      {
        id: "r2",
        players: [
          { walletAddress: "0x1111111111111111111111111111111111111111" },
          { walletAddress: "0x3333333333333333333333333333333333333333" },
        ],
      },
    ];
    const count = calculateActivePlayers(mockRooms);
    assert.strictEqual(count, 3);
  });

  it("should build complete telemetry payload object", () => {
    const payload = buildTelemetryPayload({
      rooms: [{ status: "active", players: [] }],
      dbConnected: true,
      redisConnected: false,
    });
    assert.strictEqual(payload.status, "ok");
    assert.strictEqual(payload.service, "wordpot-server");
    assert.strictEqual(payload.services.database, "connected");
    assert.strictEqual(payload.services.redis, "in_memory");
    assert.strictEqual(payload.rooms.totalRooms, 1);
  });
});

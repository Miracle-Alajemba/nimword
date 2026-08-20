import test from "node:test";
import assert from "node:assert/strict";
import { findAvailableLobbies, sortLobbiesByFillRate } from "../src/utils/matchmaking.js";

test("findAvailableLobbies filters out full, started, or expired lobbies", () => {
  const now = 1000000;
  const lobbies = [
    { roomId: "1", playerCount: 2, maxPlayers: 4, started: false, createdAt: now - 1000 },
    { roomId: "2", playerCount: 4, maxPlayers: 4, started: false, createdAt: now - 1000 }, // Full
    { roomId: "3", playerCount: 1, maxPlayers: 4, started: true, createdAt: now - 1000 },  // Started
    { roomId: "4", playerCount: 1, maxPlayers: 4, started: false, createdAt: now - 300000 },// Expired (>240s)
  ];

  const available = findAvailableLobbies(lobbies, 240000, now);
  assert.equal(available.length, 1);
  assert.equal(available[0].roomId, "1");
});

test("sortLobbiesByFillRate sorts almost-full lobbies first", () => {
  const lobbies = [
    { roomId: "1", playerCount: 1 },
    { roomId: "2", playerCount: 3 },
    { roomId: "3", playerCount: 2 },
  ];

  const sorted = sortLobbiesByFillRate(lobbies);
  assert.equal(sorted[0].roomId, "2"); // 3 players first
  assert.equal(sorted[1].roomId, "3"); // 2 players second
  assert.equal(sorted[2].roomId, "1"); // 1 player third
});

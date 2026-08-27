import cors from "cors";
import crypto from "crypto";
import dotenv from "dotenv";
import express from "express";
import fs from "fs";
import zlib from "zlib";
import { createServer } from "http";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import { canBuildFromSource, getDynamicRound } from "./rounds.js";
import { createNimWordContractService } from "./wordpot-contract.js";
import { query, initDb } from "./db.js";
import {
  initFirestore,
  getUser,
  upsertUser,
  getLeaderboard,
  getDailyChallengeStatus,
  recordDailyChallengePlay,
  recordDailyChallengeClaim,
  recordMatchSettlement,
  getGlobalPayoutStats,
} from "./firestore.js";
import { redis } from "./redis.js";
import { buildTelemetryPayload } from "./utils/telemetry.js";
import { ttlCache } from "./utils/cache.js";
import { getContractPayoutStats } from "./utils/contract-payout-tracker.js";

dotenv.config();

// Initialize Cloud Firestore database
initFirestore();

const app = express();
const port = Number(process.env.PORT || 4000);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

if (redis && redis.status === "ready") {
  try {
    const subRedis = redis.duplicate();
    subRedis.on("error", (err) => {
      console.warn("subRedis connection warning:", err.message);
    });
    io.adapter(createAdapter(redis, subRedis));
    console.info("Socket.io Redis adapter attached.");
  } catch (err) {
    console.warn("Failed to attach Socket.io Redis adapter, using in-memory adapter:", err.message);
  }
} else {
  console.info("Running Socket.io with default in-memory adapter.");
}

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("join_room", (roomId) => {
    socket.join(`room:${roomId}`);
    console.log(`Socket ${socket.id} joined room:${roomId}`);
  });

  socket.on("leave_room", (roomId) => {
    socket.leave(`room:${roomId}`);
    console.log(`Socket ${socket.id} left room:${roomId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

async function broadcastRoomUpdate(roomId, room) {
  try {
    const summary = await getRoomSummary(room);
    io.to(`room:${roomId}`).emit("room_update", summary);
    console.log(`[ws] Broadcasted room update to room:${roomId}`);
  } catch (err) {
    console.error(`Failed to broadcast room update: ${err.message}`);
  }
}
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 5;
const ROUND_SECONDS = 60;
const TREASURY_WALLET =
  process.env.TREASURY_WALLET || "0x0000000000000000000000000000000000000000";
const NIMWORD_CONTRACT_ADDRESS =
  process.env.NIMWORD_CONTRACT_ADDRESS ||
  process.env.LEXMASH_CONTRACT_ADDRESS ||
  "";
const CONTRACT_OPERATOR_PRIVATE_KEY =
  process.env.CONTRACT_OPERATOR_PRIVATE_KEY || "";
const NIM_MAINNET_RPC_URL =
  process.env.NIM_MAINNET_RPC_URL || "https://forno.nimiq.org";
const NIM_CHAIN_ID = Number(process.env.NIM_CHAIN_ID || 42220);
const JOIN_PAYMENT_WEI = process.env.JOIN_PAYMENT_WEI || "100000";
const JOIN_PAYMENT_DISPLAY = process.env.JOIN_PAYMENT_DISPLAY || "1 NIM";
const ENTRY_FEE = JOIN_PAYMENT_DISPLAY;

const REQUIRE_ONCHAIN_ROOM = process.env.REQUIRE_ONCHAIN_ROOM !== "false";
const DEFAULT_FEED_LIMIT = 24;
const DEFAULT_TX_LIMIT = 16;
const DEFAULT_LEADERBOARD_LIMIT = 50;
const DAILY_CLAIMS_FILE =
  process.env.DAILY_CLAIMS_FILE ||
  new URL("../daily-claims.json", import.meta.url);
const RECENT_DAILY_SOURCES_FILE =
  process.env.RECENT_DAILY_SOURCES_FILE ||
  new URL("../recent-daily-sources.json", import.meta.url);
const DAILY_PLAYS_FILE =
  process.env.DAILY_PLAYS_FILE ||
  new URL("../daily-plays.json", import.meta.url);
const LEADERBOARD_SEASONS_FILE =
  process.env.LEADERBOARD_SEASONS_FILE ||
  new URL("../leaderboard-seasons.json", import.meta.url);
const DAILY_LEADERBOARD_FILE =
  process.env.DAILY_LEADERBOARD_FILE ||
  new URL("../daily-challenge-leaderboard.json", import.meta.url);
const DAILY_RESET_HOUR = Math.max(
  0,
  Math.min(23, Number(process.env.DAILY_RESET_HOUR || 0)),
);
// Redis active room storage
async function saveRoom(room) {
  if (!room) return;
  await redis.set(`room:${room.id}`, JSON.stringify(room), "EX", 7200); // 2 hours TTL
}

async function getRoom(roomId) {
  try {
    const data = await redis.get(`room:${roomId}`);
    if (!data) return null;
    const room = JSON.parse(data);
    
    // Lazy expiry check
    if (room.status === "waiting") {
      const age = Date.now() - new Date(room.createdAt).getTime();
      if (age > 4 * 60 * 1000) {
        room.status = "expired";
        pushSystemEvent(room, "Room expired. No game started in time.");
        await saveRoom(room);
        await removeRoomFromWaiting(room.id, room.difficulty);
      }
    }
    return room;
  } catch (err) {
    console.error("Redis getRoom error:", err.message);
    return null;
  }
}

async function addRoomToWaiting(roomId, difficulty) {
  const targetDifficulty = normalizeDifficultyParam(difficulty);
  await redis.sadd(`waiting_rooms:${targetDifficulty}`, roomId);
}

async function removeRoomFromWaiting(roomId, difficulty) {
  const targetDifficulty = normalizeDifficultyParam(difficulty);
  await redis.srem(`waiting_rooms:${targetDifficulty}`, roomId);
}

async function getWaitingRoom(difficulty, stakeAmount = 1) {
  const targetDifficulty = normalizeDifficultyParam(difficulty);
  const targetStake = Math.max(0.1, Number(stakeAmount) || 1);
  try {
    const roomIds = await redis.smembers(`waiting_rooms:${targetDifficulty}`);
    for (const roomId of roomIds) {
      const room = await getRoom(roomId);
      if (
        room &&
        room.status === "waiting" &&
        room.players.length < MAX_PLAYERS &&
        (room.entryFeeNim === targetStake || (!room.entryFeeNim && targetStake === 1))
      ) {
        return room;
      } else if (!room || room.status !== "waiting" || room.players.length >= MAX_PLAYERS) {
        await removeRoomFromWaiting(roomId, targetDifficulty);
      }
    }
  } catch (err) {
    console.error("Redis getWaitingRoom error:", err.message);
  }
  return null;
}

// Redis daily challenge session storage
async function saveDailyChallengeSession(sessionId, session) {
  // Convert Set to Array for JSON serialization
  const toSave = {
    ...session,
    claimedWords: Array.from(session.claimedWords || [])
  };
  await redis.set(`session:daily:${sessionId}`, JSON.stringify(toSave), "EX", 900); // 15 mins TTL
}

async function getDailyChallengeSession(sessionId) {
  try {
    const data = await redis.get(`session:daily:${sessionId}`);
    if (!data) return null;
    const session = JSON.parse(data);
    session.claimedWords = new Set(session.claimedWords || []);
    return session;
  } catch (err) {
    console.error("Redis getDailyChallengeSession error:", err.message);
    return null;
  }
}

async function deleteDailyChallengeSession(sessionId) {
  await redis.del(`session:daily:${sessionId}`);
}

// Rolling source history in Redis
async function getRecentDailySourceWords() {
  try {
    const list = await redis.lrange("recent_daily_sources", 0, -1);
    return list || [];
  } catch (err) {
    console.warn("Failed to get recent daily sources:", err.message);
    return [];
  }
}

async function pushRecentDailySourceWord(word) {
  try {
    const normalized = String(word || "").trim().toUpperCase();
    if (!normalized) return;
    await redis.lpush("recent_daily_sources", normalized);
    await redis.ltrim("recent_daily_sources", 0, 99);
  } catch (err) {
    console.warn("Failed to push recent daily source:", err.message);
  }
}

async function getRecentUsedSourceWords() {
  try {
    const list = await redis.lrange("recent_used_sources", 0, -1);
    return list || [];
  } catch (err) {
    console.warn("Failed to get recent used sources:", err.message);
    return [];
  }
}

async function pushRecentUsedSourceWord(word) {
  try {
    const normalized = String(word || "").trim().toUpperCase();
    if (!normalized) return;
    await redis.lpush("recent_used_sources", normalized);
    await redis.ltrim("recent_used_sources", 0, 19);
  } catch (err) {
    console.warn("Failed to push recent used source:", err.message);
  }
}

const dailyClaims = loadDailyClaims();
const dailyPlays = loadDailyPlays();
const leaderboardSeasons = loadLeaderboardSeasons();
const dailyLeaderboard = loadDailyLeaderboard();
let roomStateVersion = 0;
let leaderboardCache = null;

const wordPotContract = createNimWordContractService({
  contractAddress: NIMWORD_CONTRACT_ADDRESS,
  operatorPrivateKey: CONTRACT_OPERATOR_PRIVATE_KEY,
  rpcUrl: NIM_MAINNET_RPC_URL,
  chainId: NIM_CHAIN_ID,
});

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "";

function isAdminRequest(req) {
  if (!ADMIN_TOKEN) return false;
  const token = String(req.headers["x-admin-token"] || "").trim();
  return token && token === ADMIN_TOKEN;
}

app.use(cors());
app.use(rateLimiter);
app.use(express.json({ limit: "32kb" }));
app.use((req, res, next) => {
  const acceptEncoding = String(req.headers["accept-encoding"] || "");
  if (!/\bgzip\b/.test(acceptEncoding)) {
    next();
    return;
  }

  const originalJson = res.json.bind(res);
  res.json = (payload) => {
    const body = JSON.stringify(payload);
    if (Buffer.byteLength(body) < 1024) {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      return res.send(body);
    }

    zlib.gzip(body, (error, compressed) => {
      if (error) {
        res.setHeader("Content-Type", "application/json; charset=utf-8");
        res.send(body);
        return;
      }
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Encoding", "gzip");
      res.setHeader("Vary", "Accept-Encoding");
      res.send(compressed);
    });
  };

  next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "nimword-server",
    timestamp: new Date().toISOString(),
    nimiq: {
      treasury: process.env.NIMIQ_TREASURY_ADDRESS ? "configured" : "missing",
      rpc: process.env.NIMIQ_RPC_URL || "default",
    },
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000;
const DEFAULT_RATE_LIMIT_MAX = 120;
const SENSITIVE_RATE_LIMIT_MAX = 20;

function getRateLimitBucket(req) {
  if (req.path === "/api/daily/claim") return "daily-claim";
  if (req.path.startsWith("/api/daily")) return "daily-general";
  if (req.method !== "GET" && req.path.startsWith("/api/rooms")) return "rooms";
  return "default";
}

function rateLimiter(req, res, next) {
  if (!req.path.startsWith("/api/")) {
    next();
    return;
  }

  const bucket = getRateLimitBucket(req);
  const maxRequests =
    (bucket === "daily-claim" || bucket === "rooms")
      ? SENSITIVE_RATE_LIMIT_MAX
      : DEFAULT_RATE_LIMIT_MAX;
  const key = `${req.ip || req.socket?.remoteAddress || "unknown"}:${bucket}`;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = (rateLimitMap.get(key) || []).filter(
    (entry) => entry > windowStart,
  );

  timestamps.push(now);
  rateLimitMap.set(key, timestamps);

  if (timestamps.length > maxRequests) {
    return res
      .status(429)
      .json({ error: "Too many requests. Please slow down and try again." });
  }

  next();
}

function loadDailyClaims() {
  try {
    if (!fs.existsSync(DAILY_CLAIMS_FILE)) {
      return new Map();
    }

    const raw = fs.readFileSync(DAILY_CLAIMS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return new Map(Object.entries(parsed || {}));
  } catch (error) {
    console.warn(`Unable to load daily claims: ${error.message}`);
    return new Map();
  }
}

function loadLeaderboardSeasons() {
  try {
    if (!fs.existsSync(LEADERBOARD_SEASONS_FILE)) {
      return { activeSeason: 1, seasonEndsAt: "2026-06-12T00:00:00Z", players: {} };
    }
    const raw = fs.readFileSync(LEADERBOARD_SEASONS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    parsed.players = parsed.players || {};
    return parsed;
  } catch (error) {
    console.warn(`Unable to load leaderboard seasons: ${error.message}`);
    return { activeSeason: 1, seasonEndsAt: "2026-06-12T00:00:00Z", players: {} };
  }
}

function persistLeaderboardSeasons() {
  try {
    fs.writeFileSync(
      LEADERBOARD_SEASONS_FILE,
      JSON.stringify(leaderboardSeasons, null, 2),
    );
  } catch (error) {
    console.error(`Unable to persist leaderboard seasons: ${error.message}`);
  }
}

function loadDailyLeaderboard() {
  try {
    if (!fs.existsSync(DAILY_LEADERBOARD_FILE)) {
      return { players: {} };
    }
    const raw = fs.readFileSync(DAILY_LEADERBOARD_FILE, "utf8");
    const parsed = JSON.parse(raw);
    parsed.players = parsed.players || {};
    return parsed;
  } catch (error) {
    console.warn(`Unable to load daily leaderboard: ${error.message}`);
    return { players: {} };
  }
}

function persistDailyLeaderboard() {
  try {
    fs.writeFileSync(
      DAILY_LEADERBOARD_FILE,
      JSON.stringify(dailyLeaderboard, null, 2),
    );
  } catch (error) {
    console.error(`Unable to persist daily leaderboard: ${error.message}`);
  }
}

async function updateDailyLeaderboard(walletAddress, score) {
  const addressLower = walletAddress.toLowerCase();
  try {
    await query(
      "INSERT INTO users (wallet_address) VALUES ($1) ON CONFLICT (wallet_address) DO NOTHING",
      [addressLower]
    );
    await query(
      `INSERT INTO daily_leaderboard (wallet_address, high_score, total_score, rounds_played, updated_at)
       VALUES ($1, $2, $2, 1, NOW())
       ON CONFLICT (wallet_address) DO UPDATE
       SET rounds_played = daily_leaderboard.rounds_played + 1,
           total_score = daily_leaderboard.total_score + EXCLUDED.high_score,
           high_score = GREATEST(daily_leaderboard.high_score, EXCLUDED.high_score),
           updated_at = NOW()`,
      [addressLower, score]
    );
    console.info(`[daily-leaderboard] Updated for ${walletAddress} with score ${score}`);
  } catch (err) {
    console.error("[daily-leaderboard] Failed to update in DB:", err.message);
  }
}



async function updateSeasonalStatsForRoom(room) {
  try {
    const derived = getRoomDerived(room);
    const scoreboard = derived.scoreboard;
    if (!scoreboard || !scoreboard.length) return;

    const winnerAddress = scoreboard[0]?.score > 0 ? scoreboard[0]?.walletAddress.toLowerCase() : null;

    for (const entry of scoreboard) {
      const addressLower = entry.walletAddress.toLowerCase();

      // Ensure user profile exists
      await query(
        "INSERT INTO users (wallet_address) VALUES ($1) ON CONFLICT (wallet_address) DO NOTHING",
        [addressLower]
      );

      // Check user booster state from DB
      const userRes = await query("SELECT booster_games_remaining FROM users WHERE wallet_address = $1", [addressLower]);
      const boosterGames = userRes.rows[0]?.booster_games_remaining || 0;
      let multiplier = 1;
      if (boosterGames > 0) {
        multiplier = 2;
        await query(
          "UPDATE users SET booster_games_remaining = booster_games_remaining - 1 WHERE wallet_address = $1",
          [addressLower]
        );
        console.info(`[leaderboard] Applied 2x booster for ${entry.walletAddress}. Boosters remaining: ${boosterGames - 1}`);
      }

      const isWinner = winnerAddress === addressLower;

      // Upsert seasonal stats
      await query(
        `INSERT INTO seasonal_leaderboard (wallet_address, season_id, score, words_found, games_played, wins, updated_at)
         VALUES ($1, 1, $2, $3, 1, $4, NOW())
         ON CONFLICT (wallet_address, season_id) DO UPDATE
         SET score = seasonal_leaderboard.score + EXCLUDED.score,
             words_found = seasonal_leaderboard.words_found + EXCLUDED.words_found,
             games_played = seasonal_leaderboard.games_played + 1,
             wins = seasonal_leaderboard.wins + EXCLUDED.wins,
             updated_at = NOW()`,
        [addressLower, entry.score * multiplier, entry.wordsFound, isWinner ? 1 : 0]
      );
    }
    console.info(`[leaderboard] Seasonal stats updated in database for room ${room.id}`);
  } catch (error) {
    console.error(`[leaderboard] Failed to update seasonal stats in DB: ${error.message}`);
  }
}

function loadRecentDailySources() {
  try {
    if (!fs.existsSync(RECENT_DAILY_SOURCES_FILE)) return [];
    const raw = fs.readFileSync(RECENT_DAILY_SOURCES_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((s) =>
        String(s || "")
          .trim()
          .toUpperCase(),
      )
      .filter(Boolean);
  } catch (error) {
    console.warn(`Unable to load recent daily sources: ${error.message}`);
    return [];
  }
}

function persistRecentDailySources() {
  try {
    fs.writeFileSync(
      RECENT_DAILY_SOURCES_FILE,
      JSON.stringify(recentDailySourceWords.slice(-100), null, 2),
    );
  } catch (error) {
    console.error(`Unable to persist recent daily sources: ${error.message}`);
  }
}

function loadDailyPlays() {
  try {
    if (!fs.existsSync(DAILY_PLAYS_FILE)) return new Map();
    const raw = fs.readFileSync(DAILY_PLAYS_FILE, "utf8");
    const parsed = JSON.parse(raw) || {};

    // Support migration from old key format wallet:YYYY-MM-DD -> value
    const out = new Map();
    for (const [key, value] of Object.entries(parsed)) {
      if (String(key).includes(":")) {
        const wallet = String(key).split(":")[0].toLowerCase();
        let playedAt;
        if (value && typeof value === "object" && value.playedAt) {
          playedAt = value.playedAt;
        } else if (typeof value === "string" && value) {
          playedAt = value;
        } else {
          playedAt = new Date().toISOString();
        }
        out.set(wallet, { playedAt });
      } else {
        const wallet = String(key).toLowerCase();
        if (value && typeof value === "object" && value.playedAt) {
          out.set(wallet, { playedAt: value.playedAt });
        } else if (typeof value === "string" && value) {
          out.set(wallet, { playedAt: value });
        }
      }
    }

    return out;
  } catch (error) {
    console.warn(`Unable to load daily plays: ${error.message}`);
    return new Map();
  }
}

function persistDailyPlays() {
  try {
    fs.writeFileSync(
      DAILY_PLAYS_FILE,
      JSON.stringify(Object.fromEntries(dailyPlays), null, 2),
    );
  } catch (error) {
    console.error(`Unable to persist daily plays: ${error.message}`);
  }
}

function getDayKeyFromTimestamp(ts = Date.now()) {
  const offsetMs = Number(DAILY_RESET_HOUR || 0) * 60 * 60 * 1000;
  const adjusted = new Date(ts - offsetMs);
  return adjusted.toISOString().slice(0, 10);
}

function getNextResetTime(ts = Date.now()) {
  const now = new Date(ts);
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const day = now.getUTCDate();

  // Candidate reset for current UTC day at reset hour
  const candidate = new Date(
    Date.UTC(year, month, day, DAILY_RESET_HOUR, 0, 0),
  );
  if (candidate.getTime() <= now.getTime()) {
    return new Date(candidate.getTime() + 24 * 60 * 60 * 1000).toISOString();
  }
  return candidate.toISOString();
}

function persistDailyClaims() {
  try {
    fs.writeFileSync(
      DAILY_CLAIMS_FILE,
      JSON.stringify(Object.fromEntries(dailyClaims), null, 2),
    );
  } catch (error) {
    console.error(`Unable to persist daily claims: ${error.message}`);
  }
}

function makeId(prefix) {
  return `${prefix}_${crypto.randomUUID().split("-")[0]}`;
}

function getRewardPool(playerCount, entryFeeNim = 1) {
  const fee = Math.max(0.1, Number(entryFeeNim) || 1);
  return (playerCount * fee * 0.9).toFixed(2);
}

function normalizeWord(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getWordScore(word) {
  if (word.length >= 6) return 12;
  if (word.length === 5) return 8;
  if (word.length === 4) return 5;
  return 3;
}

function isValidPlayerAddress(value) {
  const v = String(value || "").trim();
  return v.length >= 10;
}
const isWalletAddress = isValidPlayerAddress;
const DAILY_TARGET_SCORE = 40;


const ALLOWED_DIFFICULTIES = ["easy", "medium", "hard"];

function normalizeDifficultyParam(value) {
  const normalized = String(value || "").trim().toLowerCase();
  return ALLOWED_DIFFICULTIES.includes(normalized) ? normalized : "medium";
}

async function rememberDailySourceWord(sourceWord) {
  const normalized = String(sourceWord || "")
    .trim()
    .toUpperCase();
  if (!normalized) return;
  await pushRecentDailySourceWord(normalized);
}

async function getDailyChallengeRound(difficulty = "medium") {
  const roundDiff = difficulty === "hard" ? "hard" : difficulty === "medium" ? "medium" : "easy";
  const recentDaily = await getRecentDailySourceWords();
  try {
    const round = await import("./rounds.js").then((m) =>
      m.pickNonRecentRound(roundDiff, recentDaily),
    );
    if (round && round.sourceWord) {
      await rememberDailySourceWord(round.sourceWord);
      console.info(
        `[daily-challenge] selected new source word: ${round.sourceWord} (difficulty=${roundDiff})`,
      );
      return round;
    }
  } catch (error) {
    console.warn(
      `[daily-challenge] pickNonRecentRound failed: ${error.message}`,
    );
  }

  // Fallback: try up to 10 attempts with getDynamicRound (existing behavior)
  let fallbackRound = null;
  for (let attempt = 0; attempt < 10; attempt++) {
    const round = await getDynamicRound(roundDiff);
    fallbackRound ||= round;
    if (!recentDaily.includes(round.sourceWord)) {
      await rememberDailySourceWord(round.sourceWord);
      console.info(
        `[daily-challenge] fallback selected new source word: ${round.sourceWord} (attempt ${attempt + 1})`,
      );
      return round;
    }
    console.info(
      `[daily-challenge] fallback skipped recent source word: ${round.sourceWord} (attempt ${attempt + 1})`,
    );
  }

  if (fallbackRound) {
    await rememberDailySourceWord(fallbackRound.sourceWord);
    console.warn(
      `[daily-challenge] fallback using round: ${fallbackRound.sourceWord}`,
    );
    return fallbackRound;
  }

  return getDynamicRound(roundDiff);
}

function getTodayKey(walletAddress) {
  const today = getDayKeyFromTimestamp();
  return `${walletAddress.toLowerCase()}:${today}`;
}

function getTodayPlayKey(walletAddress) {
  const today = getDayKeyFromTimestamp();
  return `${walletAddress.toLowerCase()}:${today}`;
}

function isTxHash(value) {
  return /^0x([A-Fa-f0-9]{64})$/.test(String(value || "").trim());
}

function shortenAddress(value) {
  if (!value) return "--";
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function getNimiqExplorerTxUrl(hash) {
  const txHash = String(hash || "").trim();
  if (!txHash) return "";
  return NIM_CHAIN_ID === 44787
    ? `https://alfajores.nimiqwatch.com/tx/${txHash}`
    : `https://nimiqwatch.com/tx/${txHash}`;
}

function normalizeRefundErrorMessage(message) {
  const raw = String(message || "");
  const lower = raw.toLowerCase();
  if (lower.includes("insufficient funds"))
    return "Not enough funds in contract";
  if (lower.includes("already cancelled")) return "You already received refund";
  if (lower.includes("already settled"))
    return "Room is already settled and cannot be refunded";
  if (lower.includes("room missing")) return "Room no longer exists";
  return raw || "Onchain refund failed. Please retry.";
}

function getRoomFeed(room, limit = DEFAULT_FEED_LIMIT) {
  const normalizedLimit = Math.max(1, Number(limit) || DEFAULT_FEED_LIMIT);
  return (room.events || [])
    .slice()
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    .slice(-normalizedLimit)
    .map((entry) => ({ ...entry }));
}

function markRoomDirty(room) {
  room._version = (room._version || 0) + 1;
  room._summaryCache = null;
  room._derivedCache = null;
  roomStateVersion += 1;
  leaderboardCache = null;
}

function getPaidPlayerIds(room) {
  return getRoomDerived(room).paidPlayerIds;
}

function hasPlayerPaid(room, playerId) {
  return getPaidPlayerIds(room).has(playerId);
}

function pushSystemEvent(room, message) {
  room.events.push({
    type: "system",
    status: "system",
    message,
    createdAt: new Date().toISOString(),
  });
  markRoomDirty(room);
}

function getRoomDerived(room) {
  if (room._derivedCache?.version === room._version) {
    return room._derivedCache.value;
  }

  const playerStats = new Map(
    room.players.map((player) => [
      player.id,
      {
        playerId: player.id,
        walletAddress: player.walletAddress,
        score: 0,
        wordsFound: 0,
      },
    ]),
  );

  for (const submission of room.submissions || []) {
    const entry = playerStats.get(submission.playerId);
    if (!entry) continue;
    entry.score += submission.score;
    entry.wordsFound += 1;
  }

  const scoreboard = Array.from(playerStats.values()).sort(
    (a, b) => b.score - a.score,
  );
  const entryFeeNim = Math.max(0.1, Number(room.entryFeeNim) || 1);
  const rewardPool = Number(getRewardPool(room.players.length, entryFeeNim));
  const totalScore = scoreboard.reduce((sum, entry) => sum + entry.score, 0);
  const payouts = totalScore
    ? scoreboard.map((entry) => ({
        walletAddress: entry.walletAddress,
        amount: Number(((entry.score / totalScore) * rewardPool).toFixed(4)),
      }))
    : scoreboard.map((entry) => ({
        walletAddress: entry.walletAddress,
        amount: 0,
      }));

  const value = {
    scoreboard,
    payouts,
    paidPlayerIds: new Set(
      (room.joinTransactions || []).map((entry) => entry.playerId),
    ),
    claimPlayerIds: new Set(
      (room.claimTransactions || []).map((entry) => entry.playerId),
    ),
  };

  room._derivedCache = { version: room._version, value };
  return value;
}

function settleRoom(room) {
  if (room.status !== "active") return;
  if (!room.endsAt) return;
  if (Date.now() < room.endsAt) return;
  room.status = "finished";
  room.events.push({
    type: "system",
    status: "system",
    message: "Game over! Results are ready.",
    createdAt: new Date().toISOString(),
  });
  updateSeasonalStatsForRoom(room);
  markRoomDirty(room);
}

async function getUsernamesMap(walletAddresses) {
  const map = new Map();
  if (!walletAddresses || !walletAddresses.length) return map;
  try {
    const placeholders = walletAddresses.map((_, i) => `$${i + 1}`).join(", ");
    const dbRes = await query(
      `SELECT wallet_address, username FROM users WHERE wallet_address IN (${placeholders})`,
      walletAddresses.map(w => w.toLowerCase())
    );
    for (const row of dbRes.rows) {
      map.set(row.wallet_address.toLowerCase(), row.username);
    }
  } catch (err) {
    console.warn("Failed to fetch usernames map:", err.message);
  }
  return map;
}

async function attachUsernamesToLeaderboard(entries) {
  if (!entries || !entries.length) return entries;
  const wallets = entries.map(e => e.walletAddress).filter(Boolean);
  const usernamesMap = await getUsernamesMap(wallets);
  return entries.map(e => ({
    ...e,
    username: e.walletAddress ? (usernamesMap.get(e.walletAddress.toLowerCase()) || null) : null
  }));
}

async function getRoomSummary(room, options = {}) {
  settleRoom(room);
  const feedLimit = Math.max(
    1,
    Number(options.feedLimit) || DEFAULT_FEED_LIMIT,
  );
  const txLimit = Math.max(1, Number(options.txLimit) || DEFAULT_TX_LIMIT);
  const summaryCacheKey = `${room._version || 0}:${feedLimit}:${txLimit}`;

  const playerWallets = room.players.map((p) => p.walletAddress);
  const usernamesMap = await getUsernamesMap(playerWallets);

  if (room._summaryCache?.key === summaryCacheKey) {
    const summary = room._summaryCache.value;
    summary.players = summary.players.map(p => ({
      ...p,
      username: usernamesMap.get(p.walletAddress.toLowerCase()) || null
    }));
    return summary;
  }

  const derived = getRoomDerived(room);

  const summary = {
    id: room.id,
    status: room.status,
    difficulty: room.difficulty || "medium",
    entryFee: room.entryFee || `${room.entryFeeNim || 1} NIM`,
    entryFeeNim: room.entryFeeNim || 1,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    roundDurationSeconds: ROUND_SECONDS,
    hostPlayerId: room.hostPlayerId,
    sourceWord: room.sourceWord || null,
    rewardPool: `${getRewardPool(room.players.length, room.entryFeeNim || 1)} NIM`,
    createdAt: room.createdAt,
    expiresAt:
      room.status === "waiting" && room.createdAt
        ? new Date(
            new Date(room.createdAt).getTime() + 4 * 60 * 1000,
          ).toISOString()
        : null,
    startedAt: room.startedAt || null,
    endsAt: room.endsAt || null,
    timeLeftSeconds:
      room.status === "active" && room.endsAt
        ? Math.max(0, Math.ceil((room.endsAt - Date.now()) / 1000))
        : 0,
    players: room.players.map((player) => ({
      id: player.id,
      walletAddress: player.walletAddress,
      username: usernamesMap.get(player.walletAddress.toLowerCase()) || null,
      joinedAt: player.joinedAt,
      isHost: player.id === room.hostPlayerId,
      joinPaid: derived.paidPlayerIds.has(player.id),
      claimRecorded: derived.claimPlayerIds.has(player.id),
    })),
    feed: getRoomFeed(room, feedLimit),
    scoreboard: derived.scoreboard,
    payouts: room.status === "finished" ? derived.payouts : [],
    onchain: {
      chainId: NIM_CHAIN_ID,
      treasuryWallet: TREASURY_WALLET,
      contractAddress: NIMWORD_CONTRACT_ADDRESS,
      contractRoomId: room.contractRoomId || null,
      contractRoomCreateTx: room.contractRoomCreateTx || null,
      contractSettleTx: room.contractSettleTx || null,
      contractSettledAt: room.contractSettledAt || null,
      contractSettleError: room.contractSettleError || null,
      contractCancelTx: room.contractCancelTx || null,
      contractCancelError: room.contractCancelError || null,
      contractReady: wordPotContract.enabled,
      contractOperatorAddress: wordPotContract.enabled
        ? wordPotContract.account
        : null,
      joinPaymentWei: JOIN_PAYMENT_WEI,
      joinPaymentDisplay: JOIN_PAYMENT_DISPLAY,
      joinMode:
        isWalletAddress(NIMWORD_CONTRACT_ADDRESS) &&
        wordPotContract.enabled &&
        room.contractRoomId
          ? "contract_join"
          : "contract_unavailable",
      payoutMode:
        isWalletAddress(NIMWORD_CONTRACT_ADDRESS) &&
        wordPotContract.enabled &&
        room.contractRoomId
          ? "contract_claim"
          : "contract_unavailable",
      joinTransactions: (room.joinTransactions || []).slice(-txLimit),
      claimTransactions: (room.claimTransactions || []).slice(-txLimit),
      refundTransactions: (room.refundTransactions || []).slice(-txLimit),
      paidPlayersCount: derived.paidPlayerIds.size,
    },
    cancelledAt: room.cancelledAt || null,
  };

  room._summaryCache = { key: summaryCacheKey, value: summary };
  return summary;
}

async function getCommunityLeaderboard() {
  try {
    const res = await query(
      `SELECT wallet_address, SUM(score) as score, COUNT(*) as "wordsFound", COUNT(DISTINCT room_id) as "gamesPlayed"
       FROM submissions
       GROUP BY wallet_address
       ORDER BY score DESC
       LIMIT $1`,
      [DEFAULT_LEADERBOARD_LIMIT]
    );
    return res.rows.map((row, index) => ({
      rank: index + 1,
      walletAddress: row.wallet_address,
      score: Number(row.score || 0),
      wordsFound: Number(row.wordsFound || 0),
      gamesPlayed: Number(row.gamesPlayed || 0),
      wins: 0
    }));
  } catch (err) {
    console.error("Failed to query community leaderboard:", err.message);
    return [];
  }
}

async function getSeasonalLeaderboard() {
  try {
    const res = await query(
      `SELECT wallet_address, score, words_found as "wordsFound", games_played as "gamesPlayed", wins
       FROM seasonal_leaderboard
       WHERE season_id = $1
       ORDER BY score DESC, wins DESC
       LIMIT $2`,
      [1, DEFAULT_LEADERBOARD_LIMIT]
    );
    return res.rows.map((row, index) => ({
      rank: index + 1,
      walletAddress: row.wallet_address,
      score: Number(row.score || 0),
      wordsFound: Number(row.wordsFound || 0),
      gamesPlayed: Number(row.gamesPlayed || 0),
      wins: Number(row.wins || 0)
    }));
  } catch (err) {
    console.error("Failed to query seasonal leaderboard:", err.message);
    return [];
  }
}

async function getDailyChallengeRankings() {
  try {
    const res = await query(
      `SELECT wallet_address, high_score as "highScore", total_score as "totalScore", rounds_played as "roundsPlayed"
       FROM daily_leaderboard
       ORDER BY high_score DESC, total_score DESC
       LIMIT $1`,
      [DEFAULT_LEADERBOARD_LIMIT]
    );
    return res.rows.map((row, index) => ({
      rank: index + 1,
      walletAddress: row.wallet_address,
      score: Number(row.highScore || 0),
      totalScore: Number(row.totalScore || 0),
      roundsPlayed: Number(row.roundsPlayed || 0)
    }));
  } catch (err) {
    console.error("Failed to query daily challenge rankings:", err.message);
    return [];
  }
}

async function getRoomOr404(roomId, res) {
  const room = await getRoom(roomId);
  if (!room) {
    res.status(404).json({ error: "Room not found." });
    return null;
  }
  return room;
}

function buildSettlementPayload(room) {
  const scoreboardMap = new Map(
    getRoomDerived(room).scoreboard.map((entry) => [
      entry.playerId,
      entry.score,
    ]),
  );
  return room.players.map((player) => ({
    playerId: player.id,
    walletAddress: player.walletAddress,
    score: scoreboardMap.get(player.id) || 0,
  }));
}

const SIGNED_MESSAGE_PREFIX = "nimword-auth:";

async function verifyWalletSignature(walletAddress, signature, message) {
  if (!walletAddress) return false;
  return isValidPlayerAddress(walletAddress);
}

async function getValidatedPlayerOrError(
  room,
  playerId,
  walletAddress,
  signature,
  res,
) {
  const normalizedWallet = String(walletAddress || "").trim();

  if (!playerId) {
    res.status(400).json({ error: "Player id is required." });
    return null;
  }

  if (!isWalletAddress(normalizedWallet)) {
    res.status(400).json({ error: "A valid wallet address is required." });
    return null;
  }

  const player = room.players.find((entry) => entry.id === playerId);

  if (!player) {
    res.status(403).json({ error: "Player not found in this room." });
    return null;
  }

  if (player.walletAddress.toLowerCase() !== normalizedWallet.toLowerCase()) {
    res.status(403).json({ error: "Wallet does not match this room player." });
    return null;
  }

  if (signature) {
    const authMessage = `${SIGNED_MESSAGE_PREFIX}${playerId}:${normalizedWallet}`;
    const valid = await verifyWalletSignature(
      normalizedWallet,
      signature,
      authMessage,
    );
    if (!valid) {
      res.status(403).json({
        error:
          "Wallet signature verification failed. Connect your wallet and try again.",
      });
      return null;
    }
  }

  return player;
}

async function processRoomRefund(room, requestedByWalletAddress) {
  const paidPlayerIds = getPaidPlayerIds(room);
  const paidPlayers = room.players.filter((p) => paidPlayerIds.has(p.id));
  const paidPlayerAddresses = paidPlayers.map((p) => p.walletAddress);

  if (!paidPlayerAddresses.length) {
    throw new Error(
      "No paid players were found for this room, so no onchain refund can be processed.",
    );
  }

  if (
    !paidPlayerAddresses.some(
      (address) =>
        address.toLowerCase() ===
        String(requestedByWalletAddress || "").toLowerCase(),
    )
  ) {
    throw new Error("You are not in this room");
  }

  const cancelResult = await wordPotContract.cancelRoom(
    room.contractRoomId,
    paidPlayerAddresses,
  );

  room.status = "cancelled";
  room.cancelledAt = new Date().toISOString();
  room.contractCancelTx = cancelResult?.hash ?? null;
  room.contractCancelError = null;
  room.refundTransactions = room.refundTransactions || [];
  room.refundedWallets = Array.from(
    new Set([
      ...(room.refundedWallets || []),
      ...paidPlayerAddresses.map((a) => String(a || "").toLowerCase()),
    ]),
  );
  room.refundTransactions.push({
    hash: cancelResult?.hash ?? null,
    walletAddress: requestedByWalletAddress,
    amountWei: JOIN_PAYMENT_WEI,
    createdAt: new Date().toISOString(),
    kind: "contract_refund",
    refundedCount: paidPlayerAddresses.length,
  });
  pushSystemEvent(
    room,
    `Onchain refund sent for ${paidPlayerAddresses.length} player${paidPlayerAddresses.length === 1 ? "" : "s"}.`,
  );

  return {
    hash: cancelResult?.hash ?? null,
    gasEstimate: cancelResult?.gasEstimate ?? null,
    refundedCount: paidPlayerAddresses.length,
  };
}

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/api/health", async (_req, res) => {
  const roomsList = Array.from(rooms.values());
  const payload = buildTelemetryPayload({
    rooms: roomsList,
    dbConnected: false,
    redisConnected: Boolean(redis && redis.status === "ready"),
  });
  res.json(payload);
});

app.get("/api/stats/payouts", async (_req, res) => {
  const cached = ttlCache.get("stats_payouts");
  if (cached) {
    return res.json(cached);
  }

  const stats = await getGlobalPayoutStats();
  ttlCache.set("stats_payouts", stats, 10000);
  res.json(stats);
});

app.post("/api/users/profile", async (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const username = String(req.body?.username || "").trim();

  if (!isWalletAddress(walletAddress)) {
    return res.status(400).json({ error: "A valid wallet address is required." });
  }

  if (!username) {
    try {
      const user = await getUser(walletAddress);
      return res.json({ 
        walletAddress,
        username: user?.username || null,
        gamesPlayed: user?.gamesPlayed || 0,
        gamesWon: user?.gamesWon || 0,
        totalScore: user?.totalScore || 0,
        totalNimWon: user?.totalNimWon || 0,
        referralCode: user?.referralCode || null,
      });
    } catch (err) {
      return res.status(500).json({ error: "Database error fetching profile." });
    }
  }

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ 
      error: "Username must be 3-20 characters long and contain only letters, numbers, and underscores." 
    });
  }

  try {
    const updatedUser = await upsertUser(walletAddress, { username });
    return res.json({ 
      ok: true, 
      walletAddress,
      username: updatedUser?.username || username,
      message: "Username updated successfully." 
    });
  } catch (err) {
    console.error("Profile registration failed:", err.message);
    return res.status(500).json({ error: "Database error saving profile." });
  }
});

app.get("/api/meta", (_req, res) => {
  res.json({
    name: "NimWord",
    entryFee: ENTRY_FEE,
    roundDurationSeconds: 60,
    minPlayers: MIN_PLAYERS,
    maxPlayers: MAX_PLAYERS,
    minWordLength: 3,
    onchain: {
      chainId: NIM_CHAIN_ID,
      treasuryWallet: TREASURY_WALLET,
      contractAddress: NIMWORD_CONTRACT_ADDRESS,
      contractReady: wordPotContract.enabled,
      contractOperatorAddress: wordPotContract.enabled
        ? wordPotContract.account
        : null,
      joinPaymentWei: JOIN_PAYMENT_WEI,
      joinPaymentDisplay: JOIN_PAYMENT_DISPLAY,
      joinMode:
        isWalletAddress(NIMWORD_CONTRACT_ADDRESS) && wordPotContract.enabled
          ? "contract_join"
          : "contract_unavailable",
      payoutMode:
        isWalletAddress(NIMWORD_CONTRACT_ADDRESS) && wordPotContract.enabled
          ? "contract_claim"
          : "contract_unavailable",
    },
  });
});

app.get("/api/leaderboard", async (req, res) => {
  const walletAddress = String(req.query?.walletAddress || "").trim();
  
  let playerRecord = null;
  if (isWalletAddress(walletAddress)) {
    try {
      const user = await getUser(walletAddress);
      if (user) {
        playerRecord = {
          walletAddress,
          username: user.username || null,
          score: Number(user.totalScore || 0),
          wordsFound: 0,
          gamesPlayed: Number(user.gamesPlayed || 0),
          wins: Number(user.gamesWon || 0),
          totalNimWon: Number(user.totalNimWon || 0),
        };
      }
    } catch (dbErr) {
      console.error("Failed to query player leaderboard record:", dbErr.message);
    }
  }

  const firestoreEntries = await getLeaderboard(50);
  const entries = firestoreEntries.length > 0
    ? firestoreEntries
    : await attachUsernamesToLeaderboard(await getCommunityLeaderboard());

  const seasonalEntries = entries;
  const dailyEntries = entries;

  res.json({
    entries,
    seasonalEntries,
    dailyEntries,
    seasonInfo: {
      activeSeason: leaderboardSeasons.activeSeason,
      seasonEndsAt: leaderboardSeasons.seasonEndsAt,
    },
    playerRecord,
    treasuryWallet: TREASURY_WALLET,
    updatedAt: new Date().toISOString(),
  });
});

app.get("/api/stats", (_req, res) => {
  try {
    let totalPrize = 0;
    let playersOnline = 0;
    let activeRooms = 0;

    for (const room of rooms.values()) {
      if (room.status === "waiting" || room.status === "active") {
        activeRooms += 1;
        playersOnline += (room.players || []).length;
        totalPrize += Number(getRewardPool((room.players || []).length));
      }
    }

    // Try to read on-chain contract balance when available; fall back to aggregated room total
    (async () => {
      try {
        let onChain = null;
        if (
          wordPotContract?.enabled &&
          isWalletAddress(NIMWORD_CONTRACT_ADDRESS)
        ) {
          onChain = await wordPotContract.getContractBalance();
        }

        const prizePool = onChain || `${totalPrize.toFixed(4)} NIM`;

        res.json({
          prizePool,
          onChainBalance: onChain || null,
          playersOnline,
          activeRooms,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        res.json({
          prizePool: `${totalPrize.toFixed(4)} NIM`,
          onChainBalance: null,
          playersOnline,
          activeRooms,
          updatedAt: new Date().toISOString(),
        });
      }
    })();
  } catch (error) {
    return res
      .status(500)
      .json({ error: error.message || "Unable to compute stats" });
  }
});

app.get("/api/rounds/practice", async (_req, res) => {
  try {
    const difficulty = String(_req.query?.difficulty || "medium")
      .trim()
      .toLowerCase();

    const recentUsed = await getRecentUsedSourceWords();
    const round = await getDynamicRound(difficulty, recentUsed);

    if (round && round.sourceWord) {
      await pushRecentUsedSourceWord(round.sourceWord);
    }

    return res.json({ round });
  } catch (error) {
    return res.status(500).json({
      error: error.message || "Unable to generate a practice round right now.",
    });
  }
});

app.get("/api/rounds/daily-challenge", async (_req, res) => {
  try {
    const walletAddress = String(_req.query?.walletAddress || "").trim();
    const difficulty = String(_req.query?.difficulty || "medium").trim().toLowerCase();

    if (!isWalletAddress(walletAddress)) {
      return res.status(400).json({
        error: "Connect a valid wallet before starting Daily Challenge.",
      });
    }

    const walletKey = walletAddress.toLowerCase();
    const todayStr = getDayKeyFromTimestamp();

    // Check if claimed today using database query
    const claimCheck = await query(
      "SELECT 1 FROM daily_challenge_claims WHERE wallet_address = $1 AND DATE(claimed_at) = $2",
      [walletKey, todayStr]
    );
    if (claimCheck.rows.length > 0) {
      return res.status(409).json({
        error: "You have already claimed your daily reward today. Come back tomorrow.",
        claimed: true,
      });
    }

    // Check play cooldown using database query
    const playCheck = await query(
      "SELECT played_at FROM daily_challenge_plays WHERE wallet_address = $1 ORDER BY played_at DESC LIMIT 1",
      [walletKey]
    );
    const lastPlay = playCheck.rows[0];
    const now = Date.now();
    if (lastPlay) {
      const nextTs = new Date(lastPlay.played_at).getTime() + 24 * 60 * 60 * 1000;
      const ageMs = now - new Date(lastPlay.played_at).getTime();
      if (now < nextTs && ageMs > 2 * 60 * 1000) {
        return res.status(409).json({
          error: "You have already played the Daily Challenge within the last 24 hours.",
          played: true,
          nextAvailableAt: new Date(nextTs).toISOString(),
        });
      }
    }

    const allowedDifficulties = ["easy", "medium", "hard"];
    if (!allowedDifficulties.includes(difficulty)) {
      return res.status(400).json({
        error: "Invalid difficulty level selected.",
      });
    }

    const DIFFICULTY_RULES = {
      easy: { targetScore: 40, rewardWei: "50000000000000000", rewardDisplay: "0.1 NIM" },
      medium: { targetScore: 60, rewardWei: "1000000000000000000", rewardDisplay: "1 NIM" },
      hard: { targetScore: 110, rewardWei: "2000000000000000000", rewardDisplay: "2 NIM" }
    };

    const rules = DIFFICULTY_RULES[difficulty];
    const round = await getDailyChallengeRound(difficulty);
    const targetScore = rules.targetScore;

    const sessionId = makeId("daily");
    const session = {
      id: sessionId,
      walletAddress,
      round,
      claimedWords: [], // will be stored as array in Redis
      score: 0,
      targetScore,
      rewardWei: rules.rewardWei,
      rewardDisplay: rules.rewardDisplay,
      createdAt: new Date().toISOString(),
      expiresAt: Date.now() + 15 * 60 * 1000,
    };
    
    await saveDailyChallengeSession(sessionId, session);

    return res.json({
      round: {
        id: sessionId,
        sourceWord: round.sourceWord,
        difficulty: round.difficulty,
        validWordsCount: round.validWords?.length || 0,
        targetScore,
        rewardDisplay: rules.rewardDisplay,
      },
    });
  } catch (error) {
    console.error("Daily challenge round generation failed:", error.message);
    return res.status(500).json({
      error: error.message || "Unable to generate a daily challenge round right now.",
    });
  }
});

app.post("/api/daily/submit", async (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const sessionId = String(req.body?.sessionId || "").trim();
  const rawWord = normalizeWord(req.body?.word || "");

  if (!isWalletAddress(walletAddress)) {
    return res
      .status(400)
      .json({ error: "A valid wallet address is required." });
  }

  const session = await getDailyChallengeSession(sessionId);
  if (!session) {
    return res
      .status(404)
      .json({ error: "Daily Challenge session not found. Start a new round." });
  }

  if (session.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return res.status(403).json({
      error: "This Daily Challenge session belongs to another wallet.",
    });
  }

  if (Date.now() > session.expiresAt) {
    await deleteDailyChallengeSession(sessionId);
    return res.status(410).json({
      error: "This Daily Challenge session expired. Start a new round.",
    });
  }

  if (!rawWord) {
    return res.status(400).json({ error: "Type a word before claiming it." });
  }

  if (!/^[a-z]+$/.test(rawWord)) {
    return res.status(400).json({ error: "Only letters are allowed." });
  }

  if (rawWord.length < 3) {
    return res.status(400).json({ error: "Words must be at least 3 letters." });
  }

  if (session.claimedWords.has(rawWord)) {
    return res.status(409).json({ error: "Already claimed in this round." });
  }

  if (!canBuildFromSource(rawWord, session.round.sourceWord)) {
    return res
      .status(400)
      .json({ error: "That word uses letters outside the source word." });
  }

  if (!session.round.validWords.includes(rawWord)) {
    return res
      .status(400)
      .json({ error: "That word is not valid for this round." });
  }

  const points = getWordScore(rawWord);
  session.claimedWords.add(rawWord);
  session.score += points;

  await saveDailyChallengeSession(sessionId, session);

  return res.json({
    ok: true,
    word: rawWord,
    score: points,
    totalScore: session.score,
    wordsFound: session.claimedWords.size,
    message: `Locked in ${rawWord} for +${points} points.`,
  });
});

app.post("/api/daily/finalize", async (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const sessionId = String(req.body?.sessionId || "").trim();

  if (!isWalletAddress(walletAddress)) {
    return res.status(400).json({ error: "A valid wallet address is required." });
  }

  const session = await getDailyChallengeSession(sessionId);
  if (!session) {
    return res.json({ ok: true, message: "Session not found." });
  }

  if (session.walletAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    return res.status(403).json({ error: "This session belongs to another wallet." });
  }

  if (session.finalized) {
    return res.json({ ok: true, message: "Session already finalized." });
  }

  session.finalized = true;
  await saveDailyChallengeSession(sessionId, session);

  updateDailyLeaderboard(walletAddress, session.score);

  const todayStr = getDayKeyFromTimestamp();
  await recordDailyChallengePlay(
    walletAddress,
    todayStr,
    session.score,
    Array.from(session.claimedWords || []),
    sessionId
  );

  return res.json({
    ok: true,
    score: session.score,
    message: "Daily challenge round finalized successfully."
  });
});

app.post("/api/daily/claim", async (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const sessionId = String(req.body?.sessionId || "").trim();
  const score = Number(req.body?.score || 0);

  if (!isValidPlayerAddress(walletAddress)) {
    return res.status(400).json({ error: "A valid Nimiq wallet address is required." });
  }

  const todayStr = getDayKeyFromTimestamp();
  const claimKey = getTodayKey(walletAddress);
  const status = await getDailyChallengeStatus(walletAddress, todayStr);

  if (dailyClaims.has(claimKey) || status.claimed) {
    return res.status(409).json({ error: "You have already claimed your daily reward today. Come back tomorrow." });
  }

  if (score < DAILY_TARGET_SCORE) {
    return res.status(400).json({ error: `You need at least ${DAILY_TARGET_SCORE} points to claim the daily reward.` });
  }

  const nimiqService = createNimWordContractService();
  if (!nimiqService.enabled) {
    return res.status(503).json({ error: "Daily rewards are not available right now. Try again later." });
  }

  try {
    const rewardNim = parseFloat(process.env.DAILY_REWARD_NIM || "0.1");
    const txHash = await nimiqService.sendDailyReward(walletAddress, rewardNim);

    dailyClaims.set(claimKey, {
      walletAddress,
      claimedAt: new Date().toISOString(),
      txHash,
      amount: `${rewardNim} NIM`,
    });

    await recordDailyChallengeClaim(walletAddress, todayStr, txHash, rewardNim);

    return res.json({
      ok: true,
      txHash,
      amount: `${rewardNim} NIM`,
    });
  } catch (error) {
    console.error("[daily-claim] failed:", error.message);
    return res.status(502).json({ error: "Unable to send daily NIM reward right now. Please try again." });
  }
});

app.get("/api/daily/status", async (req, res) => {
  const walletAddress = String(req.query?.walletAddress || "").trim();

  if (!isWalletAddress(walletAddress)) {
    return res
      .status(400)
      .json({ error: "A valid wallet address is required." });
  }

  try {
    const todayStr = getDayKeyFromTimestamp();
    const claimKey = getTodayKey(walletAddress);
    const record = await getDailyChallengeStatus(walletAddress, todayStr);

    const claimed = Boolean(record.claimed || dailyClaims.has(claimKey));
    const played = Boolean(record.played || claimed);

    return res.json({
      claimed,
      played,
      claimedAt: record?.claimedAt || null,
      txHash: record?.txHash || null,
      amount: record?.claimedAmountNim ? `${record.claimedAmountNim} NIM` : null,
      policy: "daily-utc",
      treasuryWallet: TREASURY_WALLET,
    });
  } catch (err) {
    console.error("Failed to query daily status:", err.message);
    return res.status(500).json({ error: "Database query failed." });
  }
});

app.get("/api/daily/clear-all-plays-claims", async (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  try {
    await query("TRUNCATE daily_challenge_plays, daily_challenge_claims CASCADE");
    return res.json({
      ok: true,
      message: "Successfully cleared all daily challenge history (plays and claims)!",
    });
  } catch (err) {
    return res.status(500).json({ error: "Database query failed clearing history." });
  }
});

// --- Admin debug endpoints for daily plays ---
app.get("/api/debug/daily-plays", (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const entries = Array.from(dailyPlays.entries()).map(([wallet, v]) => ({
    walletAddress: wallet,
    playedAt: v?.playedAt || null,
  }));

  return res.json({ entries });
});

app.post("/api/debug/daily-plays/clear", (req, res) => {
  if (!isAdminRequest(req)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const walletAddress = String(req.body?.walletAddress || "")
    .trim()
    .toLowerCase();
  if (!isWalletAddress(walletAddress)) {
    return res
      .status(400)
      .json({ error: "A valid wallet address is required." });
  }

  const key = walletAddress;
  const existed = dailyPlays.delete(key);
  try {
    persistDailyPlays();
  } catch (err) {
    // ignore
  }

  return res.json({ ok: true, removed: !!existed });
});

app.post("/api/daily/play", async (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();
  if (!isWalletAddress(walletAddress)) {
    return res
      .status(400)
      .json({ error: "A valid wallet address is required." });
  }

  const walletKey = walletAddress.toLowerCase();
  
  try {
    const playCheck = await query(
      "SELECT played_at FROM daily_challenge_plays WHERE wallet_address = $1 ORDER BY played_at DESC LIMIT 1",
      [walletKey]
    );
    const lastPlay = playCheck.rows[0];
    const now = Date.now();
    if (lastPlay) {
      const nextTs = new Date(lastPlay.played_at).getTime() + 24 * 60 * 60 * 1000;
      if (now < nextTs) {
        return res.status(409).json({
          error: "You have already played the Daily Challenge within the last 24 hours.",
          played: true,
          nextAvailableAt: new Date(nextTs).toISOString(),
        });
      }
    }

    const todayStr = getDayKeyFromTimestamp();
    const playedAt = new Date();
    await query(
      `INSERT INTO daily_challenge_plays (wallet_address, played_date, played_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (wallet_address, played_date) DO UPDATE
       SET played_at = EXCLUDED.played_at`,
      [walletKey, todayStr, playedAt]
    );

    const nextTs = playedAt.getTime() + 24 * 60 * 60 * 1000;
    return res.json({
      ok: true,
      played: true,
      nextAvailableAt: new Date(nextTs).toISOString(),
    });
  } catch (err) {
    console.error("Failed to register daily play:", err.message);
    return res.status(500).json({ error: "Database error registering play." });
  }
});

// FIX: contract room created in background so player joins instantly
app.post("/api/rooms/quick-match", async (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const signature = String(req.body?.signature || "").trim();
  const difficulty = normalizeDifficultyParam(req.body?.difficulty);
  const stakeAmount = Math.max(0.1, Math.min(1000, Number(req.body?.stakeAmount || req.body?.entryFee || 1)));

  if (!isWalletAddress(walletAddress)) {
    return res
      .status(400)
      .json({ error: "A valid wallet address is required." });
  }

  if (signature) {
    const authMessage = `${SIGNED_MESSAGE_PREFIX}quick-match:${walletAddress}`;
    const validSig = await verifyWalletSignature(
      walletAddress,
      signature,
      authMessage,
    );
    if (!validSig) {
      return res.status(403).json({
        error:
          "Wallet signature verification failed. Connect your wallet and try again.",
      });
    }
  }

  let room = await getWaitingRoom(difficulty, stakeAmount);

  if (!room) {
    if (
      REQUIRE_ONCHAIN_ROOM &&
      (!isWalletAddress(NIMWORD_CONTRACT_ADDRESS) || !wordPotContract.enabled)
    ) {
      return res.status(503).json({
        error:
          "Live rooms are waiting for the NimWord contract operator to be configured. Restart the server with the contract key and try again.",
      });
    }

    const hostPlayerId = makeId("player");
    room = {
      id: makeId("room"),
      status: "waiting",
      difficulty,
      entryFeeNim: stakeAmount,
      entryFee: `${stakeAmount} NIM`,
      hostPlayerId,
      createdAt: new Date().toISOString(),
      players: [],
      sourceWord: null,
      startedAt: null,
      endsAt: null,
      validWords: [],
      submissions: [],
      events: [],
      joinTransactions: [],
      claimTransactions: [],
      contractRoomId: null,
      contractRoomCreateTx: null,
      _contractRoomPending: false,
    };

    await saveRoom(room);
    await addRoomToWaiting(room.id, difficulty);

    // Create contract room in background — player lands in lobby immediately
    if (wordPotContract.enabled && isWalletAddress(NIMWORD_CONTRACT_ADDRESS)) {
      room._contractRoomPending = true;
      await saveRoom(room);
      wordPotContract
        .createRoom(JOIN_PAYMENT_WEI)
        .then(async (contractRoom) => {
          const currentRoom = await getRoom(room.id);
          if (currentRoom) {
            currentRoom.contractRoomId = contractRoom?.roomId ?? null;
            currentRoom.contractRoomCreateTx = contractRoom?.hash ?? null;
            currentRoom._contractRoomPending = false;
            if (currentRoom.contractRoomId) {
              pushSystemEvent(
                currentRoom,
                `Onchain room ${currentRoom.contractRoomId} opened on NimWordArena`,
              );
            }
            markRoomDirty(currentRoom);
            await saveRoom(currentRoom);
            await broadcastRoomUpdate(currentRoom.id, currentRoom);
          }
        })
        .catch(async (error) => {
          console.error(
            "Background contract room creation failed:",
            error.message,
          );
          const currentRoom = await getRoom(room.id);
          if (currentRoom) {
            currentRoom._contractRoomPending = false;
            pushSystemEvent(
              currentRoom,
              "Onchain room setup failed. Contract joins may be unavailable for this room.",
            );
            markRoomDirty(currentRoom);
            await saveRoom(currentRoom);
            await broadcastRoomUpdate(currentRoom.id, currentRoom);
          }
        });
    } else if (REQUIRE_ONCHAIN_ROOM) {
      await deleteRoom(room.id);
      await removeRoomFromWaiting(room.id, difficulty);
      return res.status(503).json({
        error:
          "Live rooms are temporarily unavailable until the onchain room contract is ready.",
      });
    }
  }

  // TOCTOU-safe join with Redis lock
  const lowerWallet = walletAddress.toLowerCase();
  const lockKey = `lock:join:${room.id}:${lowerWallet}`;
  const lockAcquired = await redis.set(lockKey, "1", "NX", "EX", 5);

  if (!lockAcquired) {
    return res
      .status(429)
      .json({ error: "Join already in progress. Please wait." });
  }

  try {
    const currentRoom = await getRoom(room.id);
    if (!currentRoom || currentRoom.status !== "waiting") {
      await redis.del(lockKey);
      return res.status(400).json({ error: "Lobby no longer available. Try again." });
    }

    const existingPlayer = currentRoom.players.find(
      (player) => player.walletAddress.toLowerCase() === lowerWallet,
    );

    if (existingPlayer) {
      await redis.del(lockKey);
      return res.status(200).json({
        room: await getRoomSummary(currentRoom),
        playerId: existingPlayer.id,
        restored: true,
      });
    }

    const player = {
      id: currentRoom.players.length === 0 ? currentRoom.hostPlayerId : makeId("player"),
      walletAddress,
      joinedAt: new Date().toISOString(),
    };

    currentRoom.players.push(player);
    pushSystemEvent(
      currentRoom,
      `${shortenAddress(player.walletAddress)} joined the game`,
    );

    if (currentRoom.players.length >= MAX_PLAYERS) {
      await removeRoomFromWaiting(currentRoom.id, currentRoom.difficulty);
    }

    await saveRoom(currentRoom);
    await redis.del(lockKey);
    await broadcastRoomUpdate(currentRoom.id, currentRoom);

    return res
      .status(201)
      .json({ room: await getRoomSummary(currentRoom), playerId: player.id });
  } catch (error) {
    await redis.del(lockKey);
    throw error;
  }
});



app.post("/api/rooms/:roomId/join", async (req, res) => {
  const room = await getRoomOr404(req.params.roomId, res);
  if (!room) return;

  const walletAddress = String(req.body?.walletAddress || "").trim();
  const signature = String(req.body?.signature || "").trim();

  if (!isWalletAddress(walletAddress)) {
    return res
      .status(400)
      .json({ error: "A valid wallet address is required." });
  }

  if (signature) {
    const authMessage = `${SIGNED_MESSAGE_PREFIX}join:${walletAddress}`;
    const validSig = await verifyWalletSignature(
      walletAddress,
      signature,
      authMessage,
    );
    if (!validSig) {
      return res.status(403).json({
        error:
          "Wallet signature verification failed. Connect your wallet and try again.",
      });
    }
  }

  if (room.status === "expired") {
    return res.status(410).json({
      error: "This room has expired. Ask your friend to create a new one.",
    });
  }

  if (room.status !== "waiting") {
    return res
      .status(400)
      .json({ error: "This room is no longer accepting players." });
  }

  if (room.players.length >= MAX_PLAYERS) {
    return res.status(400).json({ error: "This room is already full." });
  }

  // TOCTOU-safe join with Redis lock
  const lowerWallet = walletAddress.toLowerCase();
  const lockKey = `lock:join:${room.id}:${lowerWallet}`;
  const lockAcquired = await redis.set(lockKey, "1", "NX", "EX", 5);

  if (!lockAcquired) {
    return res
      .status(429)
      .json({ error: "Join already in progress. Please wait." });
  }

  try {
    const currentRoom = await getRoom(room.id);
    if (!currentRoom || currentRoom.status !== "waiting") {
      await redis.del(lockKey);
      return res.status(400).json({ error: "Lobby no longer available. Try again." });
    }

    const existingPlayer = currentRoom.players.find(
      (player) => player.walletAddress.toLowerCase() === lowerWallet,
    );

    if (existingPlayer) {
      await redis.del(lockKey);
      return res.status(200).json({
        room: await getRoomSummary(currentRoom),
        playerId: existingPlayer.id,
        restored: true,
      });
    }

    if (currentRoom.players.length >= MAX_PLAYERS) {
      await redis.del(lockKey);
      return res.status(400).json({ error: "This room is already full." });
    }

    const player = {
      id: makeId("player"),
      walletAddress,
      joinedAt: new Date().toISOString(),
    };

    currentRoom.players.push(player);
    pushSystemEvent(
      currentRoom,
      `${shortenAddress(player.walletAddress)} joined the game`,
    );

    if (currentRoom.players.length >= MAX_PLAYERS) {
      await removeRoomFromWaiting(currentRoom.id, currentRoom.difficulty);
    }

    await saveRoom(currentRoom);
    await redis.del(lockKey);
    await broadcastRoomUpdate(currentRoom.id, currentRoom);

    return res
      .status(201)
      .json({ room: await getRoomSummary(currentRoom), playerId: player.id });
  } catch (error) {
    await redis.del(lockKey);
    throw error;
  }
});

app.get("/api/rooms/:roomId", async (req, res) => {
  const room = getRoomOr404(req.params.roomId, res);
  if (!room) return;

  const summary = await getRoomSummary(room, {
    feedLimit: req.query?.feedLimit,
    txLimit: req.query?.txLimit,
  });
  return res.json({ room: summary });
});

app.post("/api/rooms/:roomId/start", async (req, res) => {
  const room = getRoomOr404(req.params.roomId, res);
  if (!room) return;

  if (room.status === "expired") {
    return res
      .status(400)
      .json({ error: "This room has expired. Go back and start a new one." });
  }

  const playerId = String(req.body?.playerId || "").trim();
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const signature = String(req.body?.signature || "").trim();
  const player = await getValidatedPlayerOrError(
    room,
    playerId,
    walletAddress,
    signature,
    res,
  );
  if (!player) return;

  if (room.status !== "waiting") {
    return res.status(400).json({ error: "This room has already started." });
  }

  if (room.hostPlayerId !== player.id) {
    return res
      .status(403)
      .json({ error: "Only the host can start this room." });
  }

  if (room.players.length < MIN_PLAYERS) {
    return res.status(400).json({
      error: `At least ${MIN_PLAYERS} players are needed before the room can start.`,
    });
  }

  const unpaidPlayers = room.players.filter(
    (entry) => !hasPlayerPaid(room, entry.id),
  );
  if (unpaidPlayers.length) {
    return res.status(400).json({
      error: `All players must complete the onchain join payment before the room starts. ${unpaidPlayers.length} unpaid.`,
    });
  }

  const roomDifficulty = room.difficulty || "medium";
  const recentUsed = await getRecentUsedSourceWords();
  const roundSeed = await getDynamicRound(roomDifficulty, recentUsed);
  if (roundSeed && roundSeed.sourceWord) {
    await pushRecentUsedSourceWord(roundSeed.sourceWord);
  }
  room.status = "active";
  room.startedAt = new Date().toISOString();
  room.endsAt = Date.now() + ROUND_SECONDS * 1000;
  room.sourceWord = roundSeed.sourceWord;
  room.validWords = roundSeed.validWords;
  room.submissions = [];
  room.events = [];
  room._claimedWords = new Set();
  pushSystemEvent(room, "Game starting now");

  await saveRoom(room);
  await removeRoomFromWaiting(room.id, room.difficulty);
  await broadcastRoomUpdate(room.id, room);

  return res.json({ room: await getRoomSummary(room) });
});

app.post("/api/rooms/:roomId/submit", async (req, res) => {
  const room = await getRoomOr404(req.params.roomId, res);
  if (!room) return;

  const playerId = String(req.body?.playerId || "").trim();
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const rawWord = normalizeWord(req.body?.word);

  settleRoom(room);

  if (room.status !== "active") {
    return res.status(400).json({ error: "This room is not active." });
  }

  const signature = String(req.body?.signature || "").trim();
  const player = await getValidatedPlayerOrError(
    room,
    playerId,
    walletAddress,
    signature,
    res,
  );
  if (!player) return;

  async function logEvent({ status, word, score = 0, reason = "" }) {
    room.events.push({
      type: "submission",
      playerId,
      walletAddress: player.walletAddress,
      word,
      score,
      status,
      reason,
      createdAt: new Date().toISOString(),
    });
    markRoomDirty(room);
    await saveRoom(room);
  }

  if (!rawWord) {
    await logEvent({ status: "rejected", word: "", reason: "Empty submission" });
    return res.status(400).json({ error: "Type a word before claiming it." });
  }

  if (!/^[a-z]+$/.test(rawWord)) {
    await logEvent({ status: "rejected", word: rawWord, reason: "Letters only" });
    return res.status(400).json({ error: "Only letters are allowed." });
  }

  if (rawWord.length < 3) {
    await logEvent({ status: "rejected", word: rawWord, reason: "Too short" });
    return res.status(400).json({ error: "Words must be at least 3 letters." });
  }

  room._claimedWords = room._claimedWords || new Set();
  if (room._claimedWords.has(rawWord)) {
    await logEvent({ status: "rejected", word: rawWord, reason: "Already used" });
    return res.status(409).json({ error: "Already used by another player." });
  }

  if (!canBuildFromSource(rawWord, room.sourceWord)) {
    await logEvent({
      status: "rejected",
      word: rawWord,
      reason: "Outside source word",
    });
    return res
      .status(400)
      .json({ error: "That word cannot be formed from the source word." });
  }

  if (!room.validWords.includes(rawWord)) {
    await logEvent({ status: "rejected", word: rawWord, reason: "Invalid word" });
    return res
      .status(400)
      .json({ error: "That word is not valid for this round." });
  }

  const submission = {
    playerId,
    walletAddress: player.walletAddress,
    word: rawWord,
    score: getWordScore(rawWord),
    createdAt: new Date().toISOString(),
  };

  room.submissions.push(submission);
  room._claimedWords.add(rawWord);
  markRoomDirty(room);
  await logEvent({ status: "accepted", word: rawWord, score: submission.score });

  // Record submission in PostgreSQL database for permanent leaderboards
  try {
    await query(
      `INSERT INTO submissions (room_id, wallet_address, word, score)
       VALUES ($1, $2, $3, $4)`,
      [room.id, player.walletAddress.toLowerCase(), rawWord, submission.score]
    );
  } catch (dbErr) {
    console.error("Failed to persist submission in database:", dbErr.message);
  }

  await saveRoom(room);
  await broadcastRoomUpdate(room.id, room);

  return res.status(201).json({ submission, room: await getRoomSummary(room) });
});

app.post("/api/rooms/:roomId/join-tx", async (req, res) => {
  const room = await getRoomOr404(req.params.roomId, res);
  if (!room) return;

  const playerId = String(req.body?.playerId || "").trim();
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const txHash = String(req.body?.txHash || "").trim();
  const amount = String(req.body?.amount || JOIN_PAYMENT_DISPLAY).trim();
  const mode = String(req.body?.mode || "contract_join").trim();
  const signature = String(req.body?.signature || "").trim();
  const player = await getValidatedPlayerOrError(
    room,
    playerId,
    walletAddress,
    signature,
    res,
  );
  if (!player) return;

  if (!isTxHash(txHash)) {
    return res
      .status(400)
      .json({ error: "A valid transaction hash is required." });
  }

  const duplicate = room.joinTransactions.some(
    (entry) => entry.txHash.toLowerCase() === txHash.toLowerCase(),
  );
  if (!duplicate) {
    room.joinTransactions.push({
      playerId,
      walletAddress: player.walletAddress,
      txHash,
      amount,
      mode,
      createdAt: new Date().toISOString(),
    });
    pushSystemEvent(
      room,
      `${shortenAddress(player.walletAddress)} funded the room onchain`,
    );
    await saveRoom(room);
    await broadcastRoomUpdate(room.id, room);
  }

  return res.status(201).json({ room: await getRoomSummary(room) });
});

app.post("/api/rooms/:roomId/claim-tx", async (req, res) => {
  const room = await getRoomOr404(req.params.roomId, res);
  if (!room) return;

  const playerId = String(req.body?.playerId || "").trim();
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const txHash = String(req.body?.txHash || "").trim();
  const amount = String(req.body?.amount || "0").trim();
  const signature = String(req.body?.signature || "").trim();
  const player = await getValidatedPlayerOrError(
    room,
    playerId,
    walletAddress,
    signature,
    res,
  );
  if (!player) return;

  settleRoom(room);

  if (room.status !== "finished") {
    return res
      .status(400)
      .json({ error: "Rewards can only be claimed after the room ends." });
  }

  if (!isTxHash(txHash)) {
    return res
      .status(400)
      .json({ error: "A valid transaction hash is required." });
  }

  const duplicate = room.claimTransactions.some(
    (entry) => entry.txHash.toLowerCase() === txHash.toLowerCase(),
  );
  if (!duplicate) {
    room.claimTransactions.push({
      playerId,
      walletAddress: player.walletAddress,
      txHash,
      amount,
      createdAt: new Date().toISOString(),
    });
    pushSystemEvent(
      room,
      `${shortenAddress(player.walletAddress)} claimed a reward onchain`,
    );
    await saveRoom(room);
    await broadcastRoomUpdate(room.id, room);
  }

  return res.status(201).json({ room: await getRoomSummary(room) });
});

app.post("/api/rooms/:roomId/claim", async (req, res) => {
  const room = await getRoomOr404(req.params.roomId, res);
  if (!room) return;

  const playerId = String(req.body?.playerId || "").trim();
  const walletAddress = String(req.body?.walletAddress || "").trim();

  if (!playerId) return res.status(400).json({ error: "Player id is required." });
  if (!walletAddress) return res.status(400).json({ error: "Wallet address is required." });

  settleRoom(room);

  if (room.status !== "finished") {
    return res.status(400).json({ error: "Room is not finished yet." });
  }

  const derived = getRoomDerived(room);
  const payout = derived.payouts.find(
    (p) => p.walletAddress?.toLowerCase() === walletAddress.toLowerCase()
  );

  if (!payout || payout.amount <= 0) {
    return res.status(400).json({ error: "No reward available for this wallet." });
  }

  try {
    const nimiqService = createNimWordContractService();
    const txHash = await nimiqService.sendDailyReward(walletAddress, payout.amount);
    return res.json({ ok: true, txHash, amount: `${payout.amount} NIM` });
  } catch (error) {
    console.error("[claim] failed:", error.message);
    return res.status(502).json({ error: error.message || "Unable to send NIM reward." });
  }
});


app.post("/api/rooms/:roomId/settle", async (req, res) => {
  const room = await getRoomOr404(req.params.roomId, res);
  if (!room) return;
  const playerId = String(req.body?.playerId || "").trim();
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const signature = String(req.body?.signature || "").trim();
  const player = await getValidatedPlayerOrError(
    room,
    playerId,
    walletAddress,
    signature,
    res,
  );
  if (!player) return;

  settleRoom(room);
  await saveRoom(room);
  await broadcastRoomUpdate(room.id, room);

  if (room.status !== "finished") {
    return res.status(400).json({
      error: "This room is not finished yet, so it cannot be settled onchain.",
    });
  }

  if (room.contractSettledAt) {
    return res.status(200).json({ room: await getRoomSummary(room), settled: true });
  }

  if (
    !wordPotContract.enabled ||
    !isWalletAddress(NIMWORD_CONTRACT_ADDRESS) ||
    !room.contractRoomId
  ) {
    return res.status(503).json({
      error: "Onchain settlement is not available for this room yet.",
    });
  }

  try {
    const settlement = buildSettlementPayload(room);
    const settleResult = await wordPotContract.settleRoom(
      room.contractRoomId,
      settlement.map((entry) => entry.walletAddress),
      settlement.map((entry) => entry.score),
    );

    room.contractSettleTx = settleResult?.hash ?? null;
    room.contractSettledAt = new Date().toISOString();
    room.contractSettleError = null;
    pushSystemEvent(
      room,
      "Final scores were settled onchain. Claims are now live.",
    );
    await saveRoom(room);
    await broadcastRoomUpdate(room.id, room);

    return res.status(200).json({ room: await getRoomSummary(room), settled: true });
  } catch (error) {
    console.error("Contract settle failed:", error.message);
    room.contractSettleError = error.message;
    markRoomDirty(room);
    await saveRoom(room);
    await broadcastRoomUpdate(room.id, room);
    return res.status(502).json({
      error: error.message || "Unable to settle the room onchain right now.",
    });
  }
});

app.post("/api/rooms/:roomId/cancel", async (req, res) => {
  const room = await getRoomOr404(req.params.roomId, res);
  if (!room) return;

  const playerId = String(req.body?.playerId || "").trim();
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const signature = String(req.body?.signature || "").trim();
  const player = await getValidatedPlayerOrError(
    room,
    playerId,
    walletAddress,
    signature,
    res,
  );
  if (!player) return;

  if (room.hostPlayerId !== player.id) {
    return res
      .status(403)
      .json({ error: "Only the host can cancel this room." });
  }

  if (room.status !== "waiting" && room.status !== "active") {
    return res
      .status(400)
      .json({ error: "This room cannot be cancelled in its current state." });
  }

  if (room.cancelledAt) {
    return res
      .status(400)
      .json({ error: "This room has already been cancelled." });
  }

  if (getPaidPlayerIds(room).size > 0) {
    if (
      !wordPotContract.enabled ||
      !isWalletAddress(NIMWORD_CONTRACT_ADDRESS) ||
      !room.contractRoomId
    ) {
      return res
        .status(503)
        .json({ error: "Contract refund is not available for this room." });
    }

    try {
      const result = await processRoomRefund(room, player.walletAddress);
      await saveRoom(room);
      await broadcastRoomUpdate(room.id, room);
      return res.status(200).json({
        room: await getRoomSummary(room),
        txHash: result.hash,
        explorerUrl: getNimiqExplorerTxUrl(result.hash),
      });
    } catch (error) {
      console.error("[cancel-room] refund failed:", error.message);
      room.contractCancelError = error.message;
      markRoomDirty(room);
      await saveRoom(room);
      await broadcastRoomUpdate(room.id, room);
      return res
        .status(502)
        .json({ error: normalizeRefundErrorMessage(error.message) });
    }
  }

  room.status = "cancelled";
  room.cancelledAt = new Date().toISOString();
  pushSystemEvent(room, "Room cancelled by host.");
  await saveRoom(room);
  await removeRoomFromWaiting(room.id, room.difficulty);
  await broadcastRoomUpdate(room.id, room);

  return res.status(200).json({ room: await getRoomSummary(room) });
});

app.post("/api/leaderboard/season/register", (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const txHash = String(req.body?.txHash || "").trim();

  if (!isWalletAddress(walletAddress)) {
    return res.status(400).json({ error: "A valid wallet address is required." });
  }

  const addressLower = walletAddress.toLowerCase();
  if (!leaderboardSeasons.players[addressLower]) {
    leaderboardSeasons.players[addressLower] = {
      walletAddress,
      registered: false,
      score: 0,
      wordsFound: 0,
      gamesPlayed: 0,
      wins: 0,
      boosterGamesRemaining: 0,
    };
  }

  const record = leaderboardSeasons.players[addressLower];
  record.registered = true;
  if (txHash) {
    record.txHash = txHash;
  }
  record.registeredAt = new Date().toISOString();

  persistLeaderboardSeasons();

  return res.json({
    ok: true,
    message: "Successfully registered for Season 1!",
    player: record,
  });
});

app.post("/api/leaderboard/booster/buy", (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();
  const txHash = String(req.body?.txHash || "").trim();

  if (!isWalletAddress(walletAddress)) {
    return res.status(400).json({ error: "A valid wallet address is required." });
  }

  const addressLower = walletAddress.toLowerCase();
  if (!leaderboardSeasons.players[addressLower]) {
    leaderboardSeasons.players[addressLower] = {
      walletAddress,
      registered: false,
      score: 0,
      wordsFound: 0,
      gamesPlayed: 0,
      wins: 0,
      boosterGamesRemaining: 0,
    };
  }

  const record = leaderboardSeasons.players[addressLower];
  record.boosterGamesRemaining = (record.boosterGamesRemaining || 0) + 3;
  if (txHash) {
    record.boosterTxHash = txHash;
  }
  record.boosterPurchasedAt = new Date().toISOString();

  persistLeaderboardSeasons();

  return res.json({
    ok: true,
    message: "Successfully purchased a 3-game 2x Score Booster!",
    player: record,
  });
});

app.post("/api/daily/retry-purchase", (req, res) => {
  const walletAddress = String(req.body?.walletAddress || "").trim();

  if (!isWalletAddress(walletAddress)) {
    return res.status(400).json({ error: "A valid wallet address is required." });
  }

  const walletKey = walletAddress.toLowerCase();
  let clearedCount = 0;
  for (const key of dailyPlays.keys()) {
    if (key.toLowerCase() === walletKey) {
      dailyPlays.delete(key);
      clearedCount++;
    }
  }

  if (clearedCount > 0) {
    try {
      persistDailyPlays();
    } catch (err) {
      console.warn("Failed to persist daily plays:", err.message);
    }
  }

  return res.json({
    ok: true,
    message: "Retry purchased! Daily Challenge cooldown cleared.",
    cleared: clearedCount > 0,
  });
});

initDb()
  .then(() => {
    console.info("Database initialized successfully.");
  })
  .catch((err) => {
    console.warn("⚠️  Database initialization failed (server will still start):", err.message);
    console.warn("⚠️  Features requiring PostgreSQL (daily challenge, rooms, leaderboard) will be unavailable.");
  })
  .finally(() => {
    httpServer.listen(port, () => {
      console.log(`NimWord server listening on http://localhost:${port}`);
    });
  });

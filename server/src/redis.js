import Redis from "ioredis";
import dotenv from "dotenv";

dotenv.config();

const redisUrl = process.env.REDIS_URL;
const hasRedisConfig = Boolean(redisUrl || process.env.REDISHOST);

const inMemoryStore = new Map();
const inMemorySets = new Map();
const inMemoryLists = new Map();

class MemoryRedisFallback {
  constructor() {
    this.status = "memory_fallback";
  }

  on(event, handler) {
    if (event === "connect") {
      setTimeout(() => handler(), 10);
    }
  }

  duplicate() {
    return this;
  }

  async get(key) {
    return inMemoryStore.get(key) || null;
  }

  async set(key, value) {
    inMemoryStore.set(key, String(value));
    return "OK";
  }

  async del(key) {
    const existed = inMemoryStore.has(key) || inMemorySets.has(key) || inMemoryLists.has(key);
    inMemoryStore.delete(key);
    inMemorySets.delete(key);
    inMemoryLists.delete(key);
    return existed ? 1 : 0;
  }

  async sadd(key, member) {
    if (!inMemorySets.has(key)) {
      inMemorySets.set(key, new Set());
    }
    inMemorySets.get(key).add(String(member));
    return 1;
  }

  async srem(key, member) {
    if (!inMemorySets.has(key)) return 0;
    const set = inMemorySets.get(key);
    const deleted = set.delete(String(member));
    return deleted ? 1 : 0;
  }

  async smembers(key) {
    if (!inMemorySets.has(key)) return [];
    return Array.from(inMemorySets.get(key));
  }

  async lrange(key, start, stop) {
    if (!inMemoryLists.has(key)) return [];
    const list = inMemoryLists.get(key);
    if (stop === -1) return list.slice(start);
    return list.slice(start, stop + 1);
  }

  async lpush(key, value) {
    if (!inMemoryLists.has(key)) {
      inMemoryLists.set(key, []);
    }
    const list = inMemoryLists.get(key);
    list.unshift(String(value));
    return list.length;
  }

  async ltrim(key, start, stop) {
    if (!inMemoryLists.has(key)) return "OK";
    const list = inMemoryLists.get(key);
    const trimmed = stop === -1 ? list.slice(start) : list.slice(start, stop + 1);
    inMemoryLists.set(key, trimmed);
    return "OK";
  }
}

let redisClient;
let isRealRedisConnected = false;

if (hasRedisConfig) {
  try {
    const rawClient = redisUrl
      ? new Redis(redisUrl, {
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 3000,
          retryStrategy(times) {
            if (times > 3) return null; // stop retrying after 3 attempts
            return Math.min(times * 200, 1000);
          },
        })
      : new Redis({
          host: process.env.REDISHOST || "localhost",
          port: Number(process.env.REDISPORT || 6379),
          password: process.env.REDISPASSWORD || undefined,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          connectTimeout: 3000,
          retryStrategy(times) {
            if (times > 3) return null;
            return Math.min(times * 200, 1000);
          },
        });

    rawClient.on("connect", () => {
      isRealRedisConnected = true;
      console.info("Connected to Redis server.");
    });

    rawClient.on("error", (err) => {
      isRealRedisConnected = false;
      console.warn("Redis connection warning (using in-memory fallback):", err.message);
    });

    const memoryFallback = new MemoryRedisFallback();

    // Create safe proxy that automatically falls back to in-memory store if Redis is down
    redisClient = new Proxy(rawClient, {
      get(target, prop) {
        if (prop === "status") {
          return isRealRedisConnected ? target.status : "memory_fallback";
        }
        if (prop === "duplicate") {
          return () => (isRealRedisConnected ? target.duplicate() : memoryFallback);
        }

        const original = target[prop];
        if (typeof original === "function") {
          return async (...args) => {
            if (isRealRedisConnected) {
              try {
                return await original.apply(target, args);
              } catch (err) {
                console.warn(`Redis command '${String(prop)}' failed, using fallback:`, err.message);
              }
            }
            const fallbackMethod = memoryFallback[prop];
            if (typeof fallbackMethod === "function") {
              return fallbackMethod.apply(memoryFallback, args);
            }
            return null;
          };
        }
        return original;
      },
    });
  } catch (err) {
    console.warn("Failed to initialize Redis client. Falling back to in-memory store:", err.message);
    redisClient = new MemoryRedisFallback();
  }
} else {
  console.info("No REDIS_URL configured. Running with in-memory Redis fallback.");
  redisClient = new MemoryRedisFallback();
}

export const redis = redisClient;

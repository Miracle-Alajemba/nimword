import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

export const pool = new Pool(
  connectionString
    ? { 
        connectionString, 
        ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 3000,
      }
    : {
        host: process.env.PGHOST || "localhost",
        port: Number(process.env.PGPORT || 5432),
        user: process.env.PGUSER || "postgres",
        password: process.env.PGPASSWORD || "",
        database: process.env.PGDATABASE || "wordpot",
        connectionTimeoutMillis: 3000,
      }
);

pool.on("error", (err) => {
  console.warn("PostgreSQL pool background warning:", err.message);
});

export const query = async (text, params) => {
  try {
    return await pool.query(text, params);
  } catch (err) {
    console.warn(`Database query failed (${err.message}). Returning empty result.`);
    return { rows: [] };
  }
};

export async function initDb() {
  if (!connectionString && !process.env.PGHOST) {
    console.warn("No DATABASE_URL or PGHOST configured. Skipping PostgreSQL table initialization.");
    return;
  }

  const usersTable = `
    CREATE TABLE IF NOT EXISTS users (
      wallet_address VARCHAR(42) PRIMARY KEY CHECK (wallet_address ~ '^0x[a-fA-F0-9]{40}$'),
      username VARCHAR(30) UNIQUE,
      registered_season_1 BOOLEAN DEFAULT FALSE,
      registered_at TIMESTAMP,
      booster_games_remaining INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const seasonalLeaderboardTable = `
    CREATE TABLE IF NOT EXISTS seasonal_leaderboard (
      wallet_address VARCHAR(42) REFERENCES users(wallet_address) ON DELETE CASCADE,
      season_id INT NOT NULL,
      score INT DEFAULT 0,
      words_found INT DEFAULT 0,
      games_played INT DEFAULT 0,
      wins INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (wallet_address, season_id)
    );
  `;

  const dailyChallengePlaysTable = `
    CREATE TABLE IF NOT EXISTS daily_challenge_plays (
      id SERIAL PRIMARY KEY,
      wallet_address VARCHAR(42) NOT NULL,
      played_date DATE NOT NULL,
      played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_daily_play UNIQUE (wallet_address, played_date)
    );
  `;

  const dailyChallengeClaimsTable = `
    CREATE TABLE IF NOT EXISTS daily_challenge_claims (
      wallet_address VARCHAR(42) PRIMARY KEY,
      session_id VARCHAR(64) NOT NULL,
      score INT NOT NULL,
      claimed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      tx_hash VARCHAR(66) NOT NULL CHECK (tx_hash ~ '^0x[a-fA-F0-9]{64}$'),
      amount_celo NUMERIC(20, 6) NOT NULL
    );
  `;

  const dailyLeaderboardTable = `
    CREATE TABLE IF NOT EXISTS daily_leaderboard (
      wallet_address VARCHAR(42) PRIMARY KEY,
      high_score INT DEFAULT 0,
      total_score INT DEFAULT 0,
      rounds_played INT DEFAULT 0,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const roomsTable = `
    CREATE TABLE IF NOT EXISTS rooms (
      room_id VARCHAR(64) PRIMARY KEY,
      status VARCHAR(20) NOT NULL DEFAULT 'waiting',
      difficulty VARCHAR(10) NOT NULL,
      source_word VARCHAR(15),
      entry_fee_wei NUMERIC(30, 0) NOT NULL,
      reward_pool_celo NUMERIC(10, 4) NOT NULL,
      contract_room_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      started_at TIMESTAMP,
      ends_at TIMESTAMP
    );
  `;

  const submissionsTable = `
    CREATE TABLE IF NOT EXISTS submissions (
      id SERIAL PRIMARY KEY,
      room_id VARCHAR(64) REFERENCES rooms(room_id) ON DELETE CASCADE,
      wallet_address VARCHAR(42) NOT NULL,
      word VARCHAR(15) NOT NULL,
      score INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const precalculatedRoundsTable = `
    CREATE TABLE IF NOT EXISTS precalculated_rounds (
      source_word VARCHAR(15) PRIMARY KEY,
      difficulty VARCHAR(10) NOT NULL,
      valid_words TEXT[] NOT NULL
    );
  `;

  try {
    await query(usersTable);
    await query(seasonalLeaderboardTable);
    await query(dailyChallengePlaysTable);
    await query(dailyChallengeClaimsTable);
    await query(dailyLeaderboardTable);
    await query(roomsTable);
    await query(submissionsTable);
    await query(precalculatedRoundsTable);

    await query(`CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON seasonal_leaderboard (season_id, score DESC, wins DESC)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_daily_plays_lookup ON daily_challenge_plays (wallet_address, played_date)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_submissions_room ON submissions (room_id)`);
    await query(`CREATE INDEX IF NOT EXISTS idx_users_username ON users (username)`);

    console.info("PostgreSQL database tables initialized successfully.");
  } catch (err) {
    console.warn("PostgreSQL initialization warning:", err.message);
  }
}

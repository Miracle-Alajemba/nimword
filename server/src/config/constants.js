/**
 * Centralized game configuration constants for WordPot.
 */

export const GAME_RULES = {
  DEFAULT_ROUND_DURATION_SECONDS: 60,
  DAILY_CHALLENGE_DURATION_SECONDS: 60,
  LOBBY_EXPIRY_SECONDS: 240, // 4 minutes
  MIN_WORD_LENGTH: 3,
  SCORE_THRESHOLDS: {
    3: 3,
    4: 5,
    5: 8,
    6: 12,
  },
  TREASURY_FEE_BPS: 1000, // 10%
  REFERRAL_FEE_BPS: 2000, // 20% of treasury fee (2% of room pot)
};

export const CONTRACT_ADDRESSES = {
  MAINNET_ROOM_ESCROW: "0x764b3f8761CEB44e6FFA6480484b706C3c3A8284",
  MAINNET_DAILY_CHALLENGE: "0x4302D510383C6be4a284759BB0616fc6ED57e9A1",
};

export const DIFFICULTY_TIERS = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

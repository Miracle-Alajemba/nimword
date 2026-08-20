export const NIM_STAKE_LUNA = 100000; // 1 NIM = 100,000 Luna
export const NIM_STAKE_DISPLAY = "1 NIM";
export const DEFAULT_TREASURY_ADDRESS = "NQ69 9B0U S1V8 8V6A T452 7954 6C4C S05J C298";
export const NIMIQ_HUB_URL = "https://hub.nimiq.com";
export const NIMIQ_NETWORK = import.meta.env.VITE_NIMIQ_NETWORK || "main";

export const NIMWORD_STORAGE_KEY = "nimword_connected_wallet";
export const NIMWORD_SESSION_KEY = "nimword_room_session";

export const NIMWORD_GAME_RULES = [
  "Words must be at least 3 letters long",
  "Use each letter only as many times as it appears in the 7 tiles",
  "Every valid word scores based on length & bonus multipliers",
  "Stake 1 NIM to compete in prize rooms & earn rewards",
  "90% of entry fee pool is distributed to top word players",
  "Practice mode is free for zero-cost training",
];

export const GAME_RULES = NIMWORD_GAME_RULES;


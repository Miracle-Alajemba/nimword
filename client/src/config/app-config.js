export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://your-nimword-server.railway.app/api";
export const APP_URL =
  import.meta.env.VITE_APP_URL || "https://nimword.vercel.app";

export const WALLET_STORAGE_KEY = "nimword_connected_wallet";
export const ROOM_SESSION_STORAGE_KEY = "nimword_room_session";
export const REOWN_PROJECT_ID = "cbfc2451e9f790961dec9b74d3545d51";

export * from "./nimiq.js";




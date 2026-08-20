/**
 * CORS Configuration options for WordPot server.
 */

const ALLOWED_ORIGINS = [
  "https://wordpot.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
  "http://127.0.0.1:5173",
];

/**
 * Check if origin is allowed by CORS policy.
 * @param {string} origin
 * @returns {boolean}
 */
export function isOriginAllowed(origin) {
  if (!origin) return true; // Allow non-browser requests (mobile apps, curls)
  return ALLOWED_ORIGINS.includes(origin.toLowerCase().trim());
}

/**
 * Get CORS configuration object for Express.
 */
export function getCorsOptions() {
  return {
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Wallet-Address", "X-Signature"],
  };
}

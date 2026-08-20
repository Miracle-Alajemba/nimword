/**
 * Environment Configuration Loader Utility for WordPot Server
 */

/**
 * Parses and validates environment variables with fallbacks.
 * @param {object} [env=process.env]
 * @returns {object} Config object
 */
export function loadServerConfig(env = process.env) {
  return {
    port: Number(env.PORT || 4000),
    nodeEnv: env.NODE_ENV || "development",
    treasuryWallet: env.TREASURY_WALLET || null,
    wordpotContractAddress: env.WORDPOT_CONTRACT_ADDRESS || "0x4302D510383C6be4a284759BB0616fc6ED57e9A1",
    celoChainId: Number(env.CELO_CHAIN_ID || 42220),
    joinPaymentDisplay: env.JOIN_PAYMENT_DISPLAY || "0.01",
    databaseUrl: env.DATABASE_URL || null,
    databaseSsl: env.DATABASE_SSL === "true",
  };
}

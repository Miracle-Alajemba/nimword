import "@nomicfoundation/hardhat-toolbox";
import dotenv from "dotenv";

dotenv.config();

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || "";

function withAccounts() {
  return PRIVATE_KEY ? [PRIVATE_KEY] : [];
}

/** @type {import("hardhat/config").HardhatUserConfig} */
const config = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    celoSepolia: {
      url: process.env.CELO_SEPOLIA_RPC_URL || "https://forno.celo-sepolia.celo-testnet.org",
      chainId: 11142220,
      accounts: withAccounts(),
    },
    celo: {
      url: process.env.CELO_MAINNET_RPC_URL || "https://forno.celo.org",
      chainId: 42220,
      accounts: withAccounts(),
    },
  },
};

export default config;

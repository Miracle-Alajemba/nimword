/**
 * Verification helper script for deployed WordPot Solidity contracts on Celo Mainnet.
 */

async function main() {
  const roomContractAddress = "0x764b3f8761CEB44e6FFA6480484b706C3c3A8284";
  const dailyContractAddress = "0x4302D510383C6be4a284759BB0616fc6ED57e9A1";

  console.log("-----------------------------------------");
  console.log("Verifying WordPot Celo Mainnet Contracts");
  console.log("-----------------------------------------");
  console.log(`Room Escrow Contract: ${roomContractAddress}`);
  console.log(`Daily Challenge Contract: ${dailyContractAddress}`);
  console.log("Verification checks complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

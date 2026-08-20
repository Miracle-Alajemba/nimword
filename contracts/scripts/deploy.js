import dotenv from "dotenv";
import hre from "hardhat";

dotenv.config();

async function main() {
  const treasuryWallet = process.env.TREASURY_WALLET;
  const treasuryFeeBps = Number(process.env.TREASURY_FEE_BPS || 1000);
  const joinEntryWei = process.env.CONTRACT_ENTRY_FEE_WEI || "1000000000000000";

  if (!treasuryWallet) {
    throw new Error("TREASURY_WALLET is required before deployment.");
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deploying WordPotArena with ${deployer.address}`);
  console.log(`Treasury wallet: ${treasuryWallet}`);
  console.log(`Treasury fee: ${treasuryFeeBps} bps`);
  console.log(`Suggested entry fee: ${joinEntryWei} wei`);

  const factory = await hre.ethers.getContractFactory("WordPotArena");
  const contract = await factory.deploy(treasuryWallet, treasuryFeeBps);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`WordPotArena deployed to: ${address}`);
  console.log("WordPotArena deployed to:", contract.target || contract.address);
  console.log("Update WORDPOT_CONTRACT_ADDRESS in server/.env with the address above");
  console.log("");
  console.log("Next steps:");
  console.log(`1. Put WORDPOT_CONTRACT_ADDRESS=${address} into server/.env`);
  console.log("2. Restart the WordPot server");
  console.log("3. Replace treasury beta join payments with contract joinRoom()");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

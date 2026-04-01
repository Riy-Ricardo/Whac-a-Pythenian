/**
 * Deploy EntropyArenaConsumer to Monad (or any configured network).
 *
 *   npm run deploy:consumer
 *
 * Requires in .env.local or .env:
 *   MONAD_RPC_URL, DEPLOYER_PRIVATE_KEY, PYTH_ENTROPY_ADDRESS
 */
import { config as loadEnv } from "dotenv";
import { resolve } from "node:path";
import pkg from "hardhat";
const { ethers, network } = pkg;

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

async function main() {
  const entropy = process.env.PYTH_ENTROPY_ADDRESS;
  if (!entropy || !ethers.isAddress(entropy)) {
    throw new Error(
      "Set PYTH_ENTROPY_ADDRESS in .env.local (see https://docs.pyth.network/entropy/chainlist)"
    );
  }

  const gasArg = Number(process.env.ENTROPY_CALLBACK_GAS ?? "200000");
  if (!Number.isFinite(gasArg) || gasArg <= 0 || gasArg > 2 ** 32 - 1) {
    throw new Error("ENTROPY_CALLBACK_GAS must be a valid uint32");
  }

  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No deployer: set DEPLOYER_PRIVATE_KEY and use a network with accounts (e.g. --network monad)"
    );
  }

  console.log("Network:", network.name);
  console.log("Deployer:", await deployer.getAddress());

  const Factory = await ethers.getContractFactory("EntropyArenaConsumer");
  const contract = await Factory.deploy(entropy, gasArg);
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\nEntropyArenaConsumer deployed to:", address);
  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_ARENA_CONSUMER_ADDRESS=${address}`);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

import { config as loadEnv } from "dotenv";
import type { HardhatUserConfig } from "hardhat/config";
import { resolve } from "node:path";
import "@nomicfoundation/hardhat-toolbox";

loadEnv({ path: resolve(process.cwd(), ".env.local") });
loadEnv({ path: resolve(process.cwd(), ".env") });

const pk = process.env.DEPLOYER_PRIVATE_KEY?.startsWith("0x")
  ? process.env.DEPLOYER_PRIVATE_KEY
  : process.env.DEPLOYER_PRIVATE_KEY
    ? `0x${process.env.DEPLOYER_PRIVATE_KEY}`
    : undefined;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: "./contracts/src",
    tests: "./contracts/test",
    cache: "./contracts/cache-hardhat",
    artifacts: "./contracts/artifacts",
  },
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL || "https://rpc.monad.xyz",
      chainId: 143,
      accounts: pk ? [pk] : [],
    },
    hardhat: {
      chainId: 31337,
    },
  },
};

export default config;

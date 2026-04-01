/** Minimal ABI for EntropyArenaConsumer + events (wagmi). */
export const entropyArenaConsumerAbi = [
  {
    type: "function",
    name: "buySessionEntropy",
    inputs: [],
    outputs: [],
    stateMutability: "payable",
  },
  {
    type: "function",
    name: "quoteSessionFee",
    inputs: [],
    outputs: [{ name: "", type: "uint128" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sessionSeed",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "sessionPending",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "clearMySeed",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "event",
    name: "SessionReady",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "seed", type: "bytes32", indexed: false },
    ],
  },
  {
    type: "event",
    name: "SessionRequested",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "sequence", type: "uint64", indexed: false },
    ],
  },
] as const;

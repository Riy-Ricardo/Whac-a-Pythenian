import { encodePacked, keccak256 } from "viem";
import { MOLE_IMAGES } from "./moles";

export interface SpawnDerived {
  cell: number;
  imageSrc: string;
}

/** Deterministic spawn from one on-chain Pyth Entropy seed + monotonic round index. */
export function deriveSpawnFromSeed(
  seed: `0x${string}`,
  roundIndex: number,
  gridSize: number
): SpawnDerived {
  const cellCount = gridSize * gridSize;
  const h = keccak256(
    encodePacked(["bytes32", "uint256"], [seed, BigInt(roundIndex)])
  );
  const cell = Number(BigInt(h) % BigInt(cellCount));
  const h2 = keccak256(
    encodePacked(
      ["bytes32", "uint256", "string"],
      [seed, BigInt(roundIndex), "MOLE"]
    )
  );
  const imgIdx = Number(BigInt(h2) % BigInt(MOLE_IMAGES.length));
  return { cell, imageSrc: MOLE_IMAGES[imgIdx] };
}

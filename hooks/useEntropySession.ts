"use client";

import { useCallback, useMemo } from "react";
import { useAccount, useReadContract, useWatchContractEvent, useWriteContract } from "wagmi";
import { zeroHash } from "viem";
import { entropyArenaConsumerAbi } from "@/lib/entropy-abi";
import { getConsumerAddress } from "@/lib/entropy-addresses";

export type EntropyUiStatus =
  | "no-contract"
  | "disconnected"
  | "need-fund"
  | "pending"
  | "ready";

export function useEntropySession() {
  const { address, isConnected } = useAccount();
  const consumer = getConsumerAddress();
  const enabled = Boolean(consumer && address && isConnected);

  const { data: feeWei, refetch: refetchFee } = useReadContract({
    address: consumer,
    abi: entropyArenaConsumerAbi,
    functionName: "quoteSessionFee",
    query: { enabled: Boolean(consumer) },
  });

  const { data: seedRaw, refetch: refetchSeed } = useReadContract({
    address: consumer,
    abi: entropyArenaConsumerAbi,
    functionName: "sessionSeed",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: enabled ? 3_000 : false,
    },
  });

  const { data: pendingOnChain, refetch: refetchPending } = useReadContract({
    address: consumer,
    abi: entropyArenaConsumerAbi,
    functionName: "sessionPending",
    args: address ? [address] : undefined,
    query: {
      enabled,
      refetchInterval: enabled ? 2_500 : false,
    },
  });

  const seed = useMemo(() => {
    if (seedRaw === undefined || seedRaw === null) return null;
    if (seedRaw === zeroHash) return null;
    return seedRaw as `0x${string}`;
  }, [seedRaw]);

  const { writeContractAsync, isPending: isTxPending, error: writeError } =
    useWriteContract();

  const refresh = useCallback(() => {
    void refetchSeed();
    void refetchPending();
    void refetchFee();
  }, [refetchSeed, refetchPending, refetchFee]);

  useWatchContractEvent({
    address: consumer,
    abi: entropyArenaConsumerAbi,
    eventName: "SessionReady",
    enabled: Boolean(consumer && address),
    onLogs(logs) {
      for (const log of logs) {
        const p = log.args.player;
        if (
          p &&
          address &&
          p.toLowerCase() === address.toLowerCase()
        ) {
          refresh();
        }
      }
    },
  });

  const buySession = useCallback(async () => {
    if (!consumer || feeWei === undefined) return;
    await writeContractAsync({
      address: consumer,
      abi: entropyArenaConsumerAbi,
      functionName: "buySessionEntropy",
      value: BigInt(feeWei),
    });
    refresh();
  }, [consumer, feeWei, writeContractAsync, refresh]);

  const uiStatus: EntropyUiStatus = useMemo(() => {
    if (!consumer) return "no-contract";
    if (!isConnected || !address) return "disconnected";
    if (pendingOnChain) return "pending";
    if (seed) return "ready";
    return "need-fund";
  }, [consumer, isConnected, address, pendingOnChain, seed]);

  const clearSession = useCallback(async () => {
    if (!consumer) return;
    await writeContractAsync({
      address: consumer,
      abi: entropyArenaConsumerAbi,
      functionName: "clearMySeed",
    });
    refresh();
  }, [consumer, writeContractAsync, refresh]);

  return {
    consumer,
    feeWei: feeWei !== undefined ? BigInt(feeWei) : undefined,
    seed,
    pendingOnChain: Boolean(pendingOnChain),
    uiStatus,
    buySession,
    clearSession,
    isTxPending,
    writeError,
    refresh,
  };
}

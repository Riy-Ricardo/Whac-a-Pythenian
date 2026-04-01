"use client";

import { motion } from "framer-motion";
import { formatEther } from "viem";
import type { EntropyUiStatus } from "@/hooks/useEntropySession";
import { walletConnectEnabled } from "@/lib/wagmi-config";

interface EntropyGateProps {
  status: EntropyUiStatus;
  feeWei?: bigint;
  onBuy: () => void;
  txPending: boolean;
  forceArcade: boolean;
  onForceArcadeChange: (v: boolean) => void;
  hasConsumer: boolean;
}

export function EntropyGate({
  status,
  feeWei,
  onBuy,
  txPending,
  forceArcade,
  onForceArcadeChange,
  hasConsumer,
}: EntropyGateProps) {
  if (!hasConsumer) {
    return (
      <p className="mt-4 max-w-[300px] text-[11px] leading-relaxed text-white/35">
        Deploy <code className="text-white/50">EntropyArenaConsumer</code> (or reuse your{" "}
        <code className="text-white/50">PythWheelContract</code>-style flow) and set{" "}
        <code className="text-white/50">NEXT_PUBLIC_ARENA_CONSUMER_ADDRESS</code>.
        Until then, only practice RNG is available.
      </p>
    );
  }

  if (status === "disconnected") {
    return (
      <div className="mt-4 w-full max-w-[min(90vw,300px)] space-y-2 text-left">
        <p className="text-xs text-[var(--gold)]">
          Connect your wallet first — you’ll pay the Pyth Entropy fee in MON from that
          address (one tx per session).
        </p>
        {!walletConnectEnabled && (
          <p className="text-[10px] leading-relaxed text-white/35">
            WalletConnect is off (no valid{" "}
            <code className="text-white/45">NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID</code>
            ). Use an injected wallet (e.g. MetaMask). For Reown QR wallets, create a
            project at{" "}
            <a
              href="https://cloud.reown.com"
              className="text-[var(--pyth-v)] underline"
              target="_blank"
              rel="noreferrer"
            >
              cloud.reown.com
            </a>{" "}
            and add <code className="text-white/45">http://localhost:3000</code> to the
            app allowlist to fix 403 / origin errors.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-5 w-full max-w-[min(90vw,300px)] space-y-3 text-left">


      {!forceArcade && (
        <>
          {feeWei !== undefined && status !== "ready" && (
            <p className="text-[11px] leading-relaxed text-white/50">
              <span className="font-semibold text-[var(--gold-dim)]">
                Step 1 — Pay once per run:
              </span>{" "}
              <span className="font-mono text-[var(--pyth-v)]">
                {formatEther(feeWei)} MON
              </span>{" "}
              covers the Pyth <code className="text-white/40">requestV2</code> fee, All holes this
              session derive from the returned seed.
            </p>
          )}
          {status === "need-fund" && (
            <motion.button
              type="button"
              disabled={txPending || feeWei === undefined}
              onClick={() => void onBuy()}
              className="w-full border border-[var(--gold)] bg-[var(--gold)]/10 py-2.5 text-center font-bebas text-lg uppercase tracking-[0.15em] text-[var(--gold)] disabled:opacity-40"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              {txPending ? "Confirm in wallet…" : "Pay entropy session fee"}
            </motion.button>
          )}
          {status === "pending" && (
            <p className="text-center text-xs text-[var(--gold-dim)]">
              Step 2 — Waiting for Pyth callback (~2 blocks)… then tap INITIALIZE.
            </p>
          )}
          {status === "ready" && (
            <p className="text-center text-[11px] text-[var(--pyth-v)]">
              Session funded — seed on-chain. You can INITIALIZE.
            </p>
          )}
        </>
      )}

      <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-snug text-white/45">
        <input
          type="checkbox"
          checked={forceArcade}
          onChange={(e) => onForceArcadeChange(e.target.checked)}
          className="mt-0.5 accent-[var(--pyth-p)]"
        />
        <span>
          <span className="text-amber-200/80">Practice mode</span> — skip on-chain fee;
          Use just public randomness (not verifiable like{" "}
          <code className="text-white/35">Pyth Entropy</code>).
        </span>
      </label>
    </div>
  );
}
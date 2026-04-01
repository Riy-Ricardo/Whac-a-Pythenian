"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { motion } from "framer-motion";

export function ArenaHeader() {
  return (
    <motion.header
      className="relative flex w-full shrink-0 flex-col gap-3 border-b border-white/[0.06] pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:pb-5"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="max-w-xl">
        <p className="font-mono text-[10px] tracking-[0.45em] text-[var(--gold-dim)]">
          PYTHENIAN
        </p>
        <h1 className="mt-1 font-bebas text-3xl leading-[0.95] tracking-tight text-white min-[400px]:text-4xl sm:text-5xl">
          ENTROPY
          <span className="text-[var(--pyth-v)]"> ARENA</span>
        </h1>
        <p className="mt-2 max-w-md font-mono text-xs leading-relaxed text-white/40">
          Monad · Pyth Entropy session or arcade · five agents, one grid.
        </p>
      </div>
      <div className="flex shrink-0 items-center [&_button]:!font-mono [&_button]:!text-xs">
        <ConnectButton
          showBalance={false}
          chainStatus="icon"
          accountStatus="address"
        />
      </div>
    </motion.header>
  );
}

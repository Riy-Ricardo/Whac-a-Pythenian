"use client";

import { motion } from "framer-motion";

interface GameHUDProps {
  score: number;
  agentLabel: string;
  lives: number;
  rngMode: "entropy" | "arcade";
}

export function GameHUD({ score, agentLabel, lives, rngMode }: GameHUDProps) {
  return (
    <div className="flex w-full flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between sm:gap-6">
      <div className="flex flex-1 flex-wrap items-end justify-between gap-4 sm:contents">
        <div>
          <div className="stat-label">Score</div>
          <motion.div
            key={score}
            className="stat-val"
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 520, damping: 28 }}
          >
            {score.toString().padStart(4, "0")}
          </motion.div>
        </div>
        <div className="text-center sm:order-2 sm:flex-1">
          <div className="stat-label text-center">Agent</div>
          <div
            className="font-bebas text-lg text-white sm:text-xl md:text-2xl"
            title={agentLabel}
          >
            <span className="max-w-[min(100%,14ch)] truncate inline-block align-bottom">
              {agentLabel}
            </span>
          </div>
        </div>
        <div className="text-right sm:order-3">
          <div className="stat-label text-right">Integrity</div>
          <div className="stat-val text-right text-[var(--pyth-r)]">{lives}</div>
        </div>
      </div>
      <div className="flex justify-center sm:order-4 sm:w-full sm:justify-start lg:w-auto lg:justify-end">
        <span
          className={
            rngMode === "entropy"
              ? "rounded border border-[var(--pyth-v)]/40 bg-[var(--pyth-v)]/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--pyth-v)]"
              : "rounded border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[10px] font-mono uppercase tracking-[0.2em] text-amber-200/80"
          }
        >
          {rngMode === "entropy" ? "Pyth entropy" : "Arcade"}
        </span>
      </div>
    </div>
  );
}

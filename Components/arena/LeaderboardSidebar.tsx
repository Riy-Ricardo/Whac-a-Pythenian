"use client";

import { motion } from "framer-motion";
import type { LeaderboardRow } from "@/hooks/useArenaGame";

interface LeaderboardSidebarProps {
  rows: LeaderboardRow[];
}

export function LeaderboardSidebar({ rows }: LeaderboardSidebarProps) {
  return (
    <motion.aside
      className="arena-sidebar order-2 w-full max-w-full lg:order-none lg:max-h-full lg:max-w-[300px] lg:min-h-0 lg:shrink-0 lg:self-stretch xl:max-w-[320px]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="panel flex h-full min-h-[200px] flex-col p-5 sm:min-h-[240px] sm:p-6 lg:min-h-0 lg:max-h-full lg:overflow-hidden lg:p-6">
        <div className="mb-5 border-b border-white/[0.06] pb-4 text-center">
          <p className="font-mono text-[10px] tracking-[0.35em] text-[var(--gold-dim)]">
            LEADERBOARD
          </p>
          <h2 className="mt-1 font-bebas text-2xl tracking-wide text-[var(--pyth-v)]">
            TOP AGENTS
          </h2>
        </div>
        <div className="flex flex-1 flex-col gap-0 overflow-auto">
          {rows.length === 0 ? (
            <p className="py-8 text-center font-mono text-xs text-white/35">
              No runs indexed yet.
            </p>
          ) : (
            rows.map((r, i) => (
              <motion.div
                key={`${r.username}-${r.score}-${i}`}
                className="flex items-baseline justify-between gap-3 border-b border-white/[0.05] py-3.5 first:pt-0"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <span className="min-w-0 truncate font-mono text-sm text-white/85">
                  <span className="mr-2 text-[var(--gold-dim)]">{i + 1}.</span>
                  {r.username}
                </span>
                <span className="shrink-0 font-bebas text-xl text-[var(--pyth-v)]">
                  {r.score}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.aside>
  );
}

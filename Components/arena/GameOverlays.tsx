"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { GamePhase } from "@/hooks/useArenaGame";

interface GameOverlaysProps {
  phase: GamePhase;
  countdown: number | "go" | null;
  score: number;
  onAuthSubmit: () => void;
  username: string;
  onUsernameChange: (v: string) => void;
  onReload: () => void;
  entropyGate?: React.ReactNode;
  startDisabled?: boolean;
  /** When true, copy explains Pyth fee is required unless arcade is checked. */
  hasDeployedConsumer?: boolean;
}

const overlayBase =
  "absolute inset-0 z-[200] flex flex-col items-center justify-center rounded-[inherit] text-center px-4";

export function GameOverlays({
  phase,
  countdown,
  score,
  onAuthSubmit,
  username,
  onUsernameChange,
  onReload,
  entropyGate,
  startDisabled,
  hasDeployedConsumer,
}: GameOverlaysProps) {
  return (
    <>
      <AnimatePresence>
        {phase === "auth" ? (
          <motion.div
            key="auth"
            className={`${overlayBase} bg-black/95 backdrop-blur-md`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex w-full max-w-md flex-col items-center"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="mb-1 text-[10px] tracking-[0.5em] text-[var(--gold-dim)]">
                PYTHENIAN
              </p>
              <h2 className="font-bebas text-5xl leading-none text-white sm:text-6xl">
                ENTROPY ARENA
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/50">
                {hasDeployedConsumer ? (
                  <>
                    <span className="text-[var(--gold-dim)]">
                      VERIFIED PYTH ENTROPY
                    </span>{" "}
                    Pay a one-time fee to generate your on-chain seed. This seed will determine your spawns.
                  </>
                ) : (
                  <>
                    Practice arena — set{" "}
                    <code className="text-white/35">NEXT_PUBLIC_ARENA_CONSUMER_ADDRESS</code>{" "}
                    to enable verified mode.
                  </>
                )}
              </p>

              {entropyGate}

              <input
                type="text"
                value={username}
                onChange={(e) => onUsernameChange(e.target.value.slice(0, 12))}
                placeholder="CODENAME"
                maxLength={12}
                className="mt-6 w-full max-w-[280px] border border-white/15 bg-[#0a0a0a] px-4 py-3.5 text-center font-mono text-sm text-white placeholder:text-white/25 focus:border-[var(--pyth-p)] focus:outline-none focus:ring-1 focus:ring-[var(--pyth-p)]"
              />
              <motion.button
                type="button"
                className="btn btn-primary mt-5 w-full max-w-[280px]"
                onClick={onAuthSubmit}
                disabled={startDisabled}
                whileHover={startDisabled ? undefined : { scale: 1.02 }}
                whileTap={startDisabled ? undefined : { scale: 0.98 }}
              >
                INITIALIZE
              </motion.button>
              {startDisabled && (
                <p className="mt-2 max-w-[280px] text-[11px] leading-snug text-amber-200/75">
                  Connect wallet on Monad, pay the entropy session fee, wait for the
                  callback, then INITIALIZE — or enable practice mode below.
                </p>
              )}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "countdown" && countdown !== null ? (
          <motion.div
            key="cd"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[150] -translate-x-1/2 -translate-y-1/2 text-center font-bebas text-[clamp(3.5rem,20vw,9rem)] leading-none text-[var(--pyth-v)] [text-shadow:0_0_60px_rgba(240,171,255,0.35)]"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 380, damping: 22 }}
          >
            {countdown === "go" ? "GO!" : countdown}
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "level-up-banner" ? (
          <motion.div
            key="lvl"
            className="pointer-events-none absolute left-1/2 top-1/2 z-[150] -translate-x-1/2 -translate-y-1/2 text-center"
            initial={{ opacity: 0, scale: 0.88, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="banner-text line-1">LEVEL UP</div>
            <div className="banner-text line-2">SYNC STRENGTHENED</div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "lost" ? (
          <motion.div
            key="lose"
            className={`${overlayBase} z-[300] bg-black/97`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="font-bebas text-4xl text-white">SYNC LOST</h2>
            <motion.div
              className="stat-val my-5 text-6xl text-white"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              {score}
            </motion.div>
            <motion.button
              type="button"
              className="btn btn-primary w-[min(90vw,240px)]"
              onClick={onReload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              REBOOT
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {phase === "won" ? (
          <motion.div
            key="win"
            className={`${overlayBase} z-[300] animate-[victory-strobe_0.22s_infinite_alternate] gap-4 border-2 border-[var(--pyth-v)] bg-black/97 py-8`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="font-bebas text-5xl leading-none text-white sm:text-6xl">
              CHAMPION
            </h2>
            <div className="relative mx-auto h-28 w-28 overflow-hidden rounded-full border-2 border-[var(--pyth-p)] shadow-[0_0_40px_rgba(198,120,221,0.35)]">
              <Image
                src="/ricardo.png"
                alt=""
                fill
                className="object-cover object-top"
                sizes="112px"
                priority
              />
            </div>
            <p className="font-bebas max-w-xs text-xl text-[var(--pyth-v)] sm:text-2xl">
              ASK RICARDO FOR YOUR PP&apos;S
            </p>
            <motion.button
              type="button"
              className="btn btn-primary w-[min(90vw,260px)]"
              onClick={onReload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              RECLAIM GLORY
            </motion.button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

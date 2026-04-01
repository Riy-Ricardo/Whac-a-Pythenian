"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import { useArenaGame } from "@/hooks/useArenaGame";
import { useEntropySession } from "@/hooks/useEntropySession";
import { getConsumerAddress } from "@/lib/entropy-addresses";
import { ArenaHeader } from "./ArenaHeader";
import { EntropyGate } from "./EntropyGate";
import { GameHUD } from "./GameHUD";
import { GameGrid } from "./GameGrid";
import { GameOverlays } from "./GameOverlays";
import { LeaderboardSidebar } from "./LeaderboardSidebar";

function shortAddr(a: string) {
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

export function ArenaGame() {
  const { address, isConnected } = useAccount();
  const entropy = useEntropySession();
  /** When consumer is deployed: default to verified mode (must pay entropy fee once). No consumer → arcade only. */
  const [forceArcade, setForceArcade] = useState(
    () => !getConsumerAddress()
  );

  const effectiveSeed =
    !forceArcade && entropy.seed ? entropy.seed : null;

  const { refreshLeaderboard, ...game } = useArenaGame({
    entropySeed: effectiveSeed,
  });

  useEffect(() => {
    void refreshLeaderboard();
  }, [refreshLeaderboard]);

  const agentLabel = useMemo(() => {
    const name = game.username || "AGENT";
    if (isConnected && address) {
      return `${name} · ${shortAddr(address)}`;
    }
    return name;
  }, [game.username, isConnected, address]);

  const showSidebar = game.phase !== "auth";

  const hasConsumer = Boolean(entropy.consumer);

  const startDisabled = Boolean(
    hasConsumer &&
      !forceArcade &&
      (!isConnected ||
        entropy.uiStatus === "need-fund" ||
        entropy.uiStatus === "pending")
  );

  return (
    <div className="relative flex min-h-0 w-full max-w-[1240px] flex-1 flex-col gap-4 px-4 pb-4 pt-3 sm:gap-5 sm:px-6 sm:pb-6 sm:pt-4 lg:gap-6 lg:px-8 lg:pb-5 lg:pt-5">
      <div
        className="pointer-events-none absolute -left-24 top-20 hidden h-64 w-64 rotate-12 rounded-full bg-[var(--pyth-p)]/5 blur-3xl lg:block"
        aria-hidden
      />
      <ArenaHeader />

      <div className="flex min-h-0 flex-1 flex-col gap-4 sm:gap-5 lg:flex-row lg:items-stretch lg:gap-6">
        <motion.main className="order-1 flex min-h-0 min-w-0 flex-1 flex-col lg:order-none lg:min-h-0">
          <div className="panel relative flex min-h-0 flex-1 flex-col gap-4 overflow-hidden p-4 sm:gap-5 sm:p-6 lg:gap-5 lg:p-8">
            <GameOverlays
              phase={game.phase}
              countdown={game.countdown}
              score={game.score}
              username={game.username}
              onUsernameChange={game.setUsername}
              onAuthSubmit={game.startLogin}
              onReload={game.reload}
              startDisabled={startDisabled}
              hasDeployedConsumer={hasConsumer}
              entropyGate={
                <EntropyGate
                  status={entropy.uiStatus}
                  feeWei={entropy.feeWei}
                  onBuy={entropy.buySession}
                  txPending={entropy.isTxPending}
                  forceArcade={forceArcade}
                  onForceArcadeChange={setForceArcade}
                  hasConsumer={hasConsumer}
                />
              }
            />

            <GameHUD
              score={game.score}
              agentLabel={agentLabel}
              lives={game.lives}
              rngMode={game.rngMode}
            />

            <div className="flex min-h-0 flex-1 flex-col justify-center py-1">
              <GameGrid
                gridSize={game.gridSize}
                activeCell={game.activeCell}
                activeMoleSrc={game.activeMoleSrc}
                onCellPointerDown={game.onCellPointerDown}
                disabled={game.phase !== "playing"}
              />
            </div>
          </div>
        </motion.main>

        {showSidebar ? <LeaderboardSidebar rows={game.leaderboard} /> : null}
      </div>
    </div>
  );
}

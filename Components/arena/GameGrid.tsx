"use client";

import { motion, AnimatePresence } from "framer-motion";

interface GameGridProps {
  gridSize: number;
  activeCell: number | null;
  activeMoleSrc: string | null;
  onCellPointerDown: (index: number) => void;
  disabled: boolean;
}

export function GameGrid({
  gridSize,
  activeCell,
  activeMoleSrc,
  onCellPointerDown,
  disabled,
}: GameGridProps) {
  const total = gridSize * gridSize;
  /** vw for width; vmin keeps holes smaller on short desktop/laptop viewports. */
  const nodeSize =
    gridSize === 3
      ? "min(22vw, 12vmin, 112px)"
      : gridSize === 4
        ? "min(17vw, 10vmin, 92px)"
        : "min(14vw, 8.5vmin, 76px)";

  return (
    <div
      className="arena-hole-grid mx-auto grid w-full max-w-[min(100%,min(92vw,420px))] justify-items-center gap-1.5 sm:gap-3"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: total }, (_, i) => {
        const active = activeCell === i;
        return (
          <motion.button
            key={`${gridSize}-${i}`}
            type="button"
            disabled={disabled}
            className="arena-hole node relative flex cursor-pointer items-end justify-center overflow-hidden rounded-full border-2 border-[var(--ring)] bg-[#070707] shadow-[inset_0_12px_28px_rgba(0,0,0,0.85)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--pyth-v)] disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              width: nodeSize,
              height: nodeSize,
              boxShadow: active
                ? "inset 0 12px 28px rgba(0,0,0,0.85), 0 0 0 1px rgba(198,120,221,0.35), 0 0 24px rgba(240,171,255,0.15)"
                : undefined,
            }}
            onPointerDown={(e) => {
              e.preventDefault();
              onCellPointerDown(i);
            }}
            whileTap={disabled ? undefined : { scale: 0.94 }}
            layout
          >
            <span
              className="pointer-events-none absolute inset-x-[12%] bottom-[8%] top-[18%] rounded-full bg-black/80 blur-md"
              aria-hidden
            />
            <AnimatePresence mode="sync">
              {active && activeMoleSrc ? (
                <motion.div
                  key={activeMoleSrc}
                  className="pointer-events-none absolute inset-x-0 bottom-0 top-0 bg-cover bg-bottom bg-no-repeat"
                  style={{ backgroundImage: `url(${activeMoleSrc})` }}
                  initial={{ y: "108%", opacity: 0.85 }}
                  animate={{ y: "0%", opacity: 1 }}
                  exit={{ y: "108%", opacity: 0.6 }}
                  transition={{
                    type: "spring",
                    stiffness: 520,
                    damping: 26,
                  }}
                />
              ) : null}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

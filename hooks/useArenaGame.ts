"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  playCountdownSound,
  playHitSound,
  playLevelUpSound,
  playWinSound,
  resumeAudio,
} from "@/lib/audio";
import { deriveSpawnFromSeed } from "@/lib/derive-spawn";
import { FORTUNA_BASE, FORTUNA_CHAIN } from "@/lib/constants";
import { pickRandomMoleSrc } from "@/lib/moles";
import { getSupabase } from "@/lib/supabase";

export type GamePhase =
  | "auth"
  | "countdown"
  | "playing"
  | "level-up-banner"
  | "won"
  | "lost";

export interface LeaderboardRow {
  username: string;
  score: number;
}

export interface UseArenaGameOptions {
  /** On-chain Pyth Entropy session seed — all spawns derive from this (pay once per session). */
  entropySeed?: `0x${string}` | null;
}

export interface UseArenaGame {
  username: string;
  setUsername: (v: string) => void;
  score: number;
  lives: number;
  level: number;
  gridSize: number;
  phase: GamePhase;
  countdown: number | "go" | null;
  activeCell: number | null;
  activeMoleSrc: string | null;
  rngMode: "entropy" | "arcade";
  startLogin: () => void;
  onCellPointerDown: (index: number) => void;
  reload: () => void;
  leaderboard: LeaderboardRow[];
  refreshLeaderboard: () => void;
}

async function getOracleMove(gridSize: number, seq: number): Promise<number> {
  const userBytes = crypto.getRandomValues(new Uint8Array(32));
  let providerHex: string | null = null;
  try {
    const resp = await fetch(
      `${FORTUNA_BASE}/v1/chains/${FORTUNA_CHAIN}/revelations/${seq}`,
      { signal: AbortSignal.timeout(2000) }
    );
    if (resp.ok) {
      const data = (await resp.json()) as {
        value?: { data?: string };
        revelation?: string;
      };
      providerHex = data?.value?.data ?? data?.revelation ?? null;
    }
  } catch {
    /* fallback */
  }
  if (!providerHex) {
    providerHex = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  const provBytes = new Uint8Array(
    providerHex.replace(/^0x/, "").match(/.{2}/g)!.map((h) => parseInt(h, 16))
  );
  const combined = new Uint8Array(provBytes.length + userBytes.length);
  combined.set(provBytes);
  combined.set(userBytes, provBytes.length);
  const hashBuffer = await crypto.subtle.digest("SHA-256", combined);
  const res = new Uint8Array(hashBuffer);
  const n = ((res[0] << 24) | (res[1] << 16) | (res[2] << 8) | res[3]) >>> 0;
  return n % (gridSize * gridSize);
}

export function useArenaGame(options?: UseArenaGameOptions): UseArenaGame {
  const entropySeed = options?.entropySeed ?? null;
  const rngMode: "entropy" | "arcade" = entropySeed ? "entropy" : "arcade";

  const [username, setUsername] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(5);
  const [level, setLevel] = useState(1);
  const [gridSize, setGridSize] = useState(3);
  const [phase, setPhase] = useState<GamePhase>("auth");
  const [countdown, setCountdown] = useState<number | "go" | null>(null);
  const [activeCell, setActiveCell] = useState<number | null>(null);
  const [activeMoleSrc, setActiveMoleSrc] = useState<string | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);

  const seqRef = useRef(1);
  const roundIndexRef = useRef(0);
  const spawnRef = useRef<(() => Promise<void>) | undefined>(undefined);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hitRef = useRef(false);
  const activeRef = useRef(false);
  const gridSizeRef = useRef(3);
  const levelRef = useRef(1);
  const hitsInLevelRef = useRef(0);
  const usernameRef = useRef("");
  const scoreRef = useRef(0);

  useEffect(() => {
    gridSizeRef.current = gridSize;
  }, [gridSize]);
  useEffect(() => {
    levelRef.current = level;
  }, [level]);
  useEffect(() => {
    usernameRef.current = username;
  }, [username]);
  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    roundIndexRef.current = 0;
    seqRef.current = 1;
  }, [entropySeed]);

  const fetchLeaderboard = useCallback(async () => {
    const sb = getSupabase();
    if (!sb) return;
    const { data } = await sb
      .from("leaderboard")
      .select("*")
      .order("score", { ascending: false })
      .limit(5);
    if (data) {
      setLeaderboard(
        (data as { username: string; score: number }[]).map((r) => ({
          username: r.username,
          score: r.score,
        }))
      );
    }
  }, []);

  const clearSpawn = useCallback(() => {
    if (spawnTimerRef.current) {
      clearTimeout(spawnTimerRef.current);
      spawnTimerRef.current = null;
    }
  }, []);

  const endGame = useCallback(async () => {
    activeRef.current = false;
    clearSpawn();
    setPhase("lost");
    setActiveCell(null);
    setActiveMoleSrc(null);
    const sb = getSupabase();
    const final = scoreRef.current;
    if (sb) {
      await sb.from("leaderboard").insert([
        { username: usernameRef.current || "AGENT", score: final },
      ]);
    }
    void fetchLeaderboard();
  }, [clearSpawn, fetchLeaderboard]);

  const winGame = useCallback(async () => {
    activeRef.current = false;
    clearSpawn();
    setPhase("won");
    setActiveCell(null);
    setActiveMoleSrc(null);
    playWinSound();
    const sb = getSupabase();
    const final = scoreRef.current;
    if (sb) {
      await sb.from("leaderboard").insert([
        { username: usernameRef.current || "AGENT", score: final },
      ]);
    }
    void fetchLeaderboard();
  }, [clearSpawn, fetchLeaderboard]);

  const spawn = useCallback(async () => {
    if (!activeRef.current) return;
    const gs = gridSizeRef.current;
    let idx: number;
    if (entropySeed) {
      const ri = roundIndexRef.current++;
      const d = deriveSpawnFromSeed(entropySeed, ri, gs);
      idx = d.cell;
      setActiveMoleSrc(d.imageSrc);
    } else {
      const seq = seqRef.current++;
      idx = await getOracleMove(gs, seq);
      setActiveMoleSrc(pickRandomMoleSrc());
    }
    hitRef.current = false;
    setActiveCell(idx);

    const speed = 1000 - levelRef.current * 120;
    const delay = Math.max(speed, 400);

    spawnTimerRef.current = setTimeout(() => {
      setActiveCell(null);
      setActiveMoleSrc(null);
      if (!hitRef.current && activeRef.current) {
        setLives((prev) => {
          const next = prev - 1;
          if (next <= 0) {
            void endGame();
            return 0;
          }
          return next;
        });
      }
      if (activeRef.current) void spawnRef.current?.();
    }, delay);
  }, [endGame, entropySeed]);

  useEffect(() => {
    spawnRef.current = spawn;
  }, [spawn]);

  const levelUp = useCallback(() => {
    activeRef.current = false;
    clearSpawn();
    playLevelUpSound();
    hitsInLevelRef.current = 0;
    const nextLevel = levelRef.current + 1;
    setLevel(nextLevel);
    levelRef.current = nextLevel;
    let nextGrid = gridSizeRef.current;
    if (nextLevel === 2) nextGrid = 4;
    if (nextLevel >= 3) nextGrid = 5;
    gridSizeRef.current = nextGrid;
    setGridSize(nextGrid);
    setPhase("level-up-banner");
    setActiveCell(null);
    setActiveMoleSrc(null);
    setTimeout(() => {
      setPhase("playing");
      activeRef.current = true;
      void spawnRef.current?.();
    }, 1500);
  }, [clearSpawn]);

  const onCellPointerDown = useCallback(
    (index: number) => {
      if (!activeRef.current || phase !== "playing") return;
      if (activeCell !== index) return;
      if (hitRef.current) return;
      hitRef.current = true;
      playHitSound();

      const nextScore = scoreRef.current + 100;
      scoreRef.current = nextScore;
      setScore(nextScore);

      hitsInLevelRef.current += 1;
      setActiveCell(null);
      setActiveMoleSrc(null);
      if (spawnTimerRef.current) {
        clearTimeout(spawnTimerRef.current);
        spawnTimerRef.current = null;
      }

      if (hitsInLevelRef.current >= 2) {
        if (levelRef.current === 3) {
          void winGame();
          return;
        }
        levelUp();
        return;
      }
      if (activeRef.current) void spawnRef.current?.();
    },
    [activeCell, phase, levelUp, winGame]
  );

  useEffect(() => {
    return () => clearSpawn();
  }, [clearSpawn]);

  const startCountdown = useCallback(() => {
    setPhase("countdown");
    resumeAudio();
    setCountdown(3);
    playCountdownSound(false);

    setTimeout(() => {
      setCountdown(2);
      playCountdownSound(false);
    }, 1000);
    setTimeout(() => {
      setCountdown(1);
      playCountdownSound(false);
    }, 2000);
    setTimeout(() => {
      setCountdown("go");
      playCountdownSound(true);
    }, 3000);
    setTimeout(() => {
      setCountdown(null);
      setPhase("playing");
      activeRef.current = true;
      void spawnRef.current?.();
    }, 3800);
  }, []);

  const startLogin = useCallback(() => {
    const name = username.trim() || "AGENT";
    setUsername(name);
    usernameRef.current = name;
    void fetchLeaderboard();
    startCountdown();
  }, [username, fetchLeaderboard, startCountdown]);

  const reload = useCallback(() => {
    clearSpawn();
    seqRef.current = 1;
    activeRef.current = false;
    hitRef.current = false;
    hitsInLevelRef.current = 0;
    scoreRef.current = 0;
    setScore(0);
    setLives(5);
    setLevel(1);
    setGridSize(3);
    levelRef.current = 1;
    gridSizeRef.current = 3;
    setActiveCell(null);
    setActiveMoleSrc(null);
    setCountdown(null);
    setPhase("auth");
    roundIndexRef.current = 0;
  }, [clearSpawn]);

  return {
    username,
    setUsername,
    score,
    lives,
    level,
    gridSize,
    phase,
    countdown,
    activeCell,
    activeMoleSrc,
    rngMode,
    startLogin,
    onCellPointerDown,
    reload,
    leaderboard,
    refreshLeaderboard: fetchLeaderboard,
  };
}

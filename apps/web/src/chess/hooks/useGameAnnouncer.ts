import { useEffect, useRef } from "react";
import { speak } from "../audio/announcer";
import { resultAnnouncement, type GameResult } from "../gameResult";
import type { GameMode } from "../types";

export function useGameAnnouncer(result: GameResult, mode: GameMode, vsCpu = true) {
  const lastAnnounced = useRef<string | null>(null);

  useEffect(() => {
    const text = resultAnnouncement(result, mode === "4p" ? "4p" : mode, vsCpu);
    if (!text || text === lastAnnounced.current) return;

    lastAnnounced.current = text;
    const delay = result.kind === "check" ? 200 : 500;
    const timer = window.setTimeout(() => speak(text), delay);
    return () => window.clearTimeout(timer);
  }, [result, mode, vsCpu]);

  useEffect(() => {
    if (result.kind === "playing") {
      lastAnnounced.current = null;
    }
  }, [result.kind]);
}

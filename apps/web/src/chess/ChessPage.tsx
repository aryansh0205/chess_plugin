import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/design";
import { isVoiceEnabled, preloadVoices, setVoiceEnabled, stopSpeaking } from "./audio/announcer";
import { CapturedTray } from "./components/CapturedTray";
import { FourPlayerBoard } from "./components/FourPlayerBoard";
import { GamePanel } from "./components/GamePanel";
import { MateOverlay } from "./components/MateOverlay";
import { StandardBoard } from "./components/StandardBoard";
import { useFourPlayerChess } from "./fourPlayer/useFourPlayerChess";
import { useGameAnnouncer } from "./hooks/useGameAnnouncer";
import { useStandardChess } from "./standard/useStandardChess";
import type { GameMode } from "./types";
import { FOUR_PLAYER_COLORS, FOUR_PLAYER_NAMES } from "./types";

function initialGameMode(): GameMode {
  if (typeof window === "undefined") return "cpu";
  const q = new URLSearchParams(window.location.search).get("mode");
  if (q === "4p" || q === "2p" || q === "cpu") return q;
  return "cpu";
}

export function ChessPage() {
  const { mode: themeMode, toggleMode } = useTheme();
  const [gameMode, setGameMode] = useState<GameMode>(initialGameMode);
  const [voiceOn, setVoiceOn] = useState(() => {
    preloadVoices();
    return isVoiceEnabled();
  });
  const [fourVsCpu, setFourVsCpu] = useState(true);
  const [overlayDismissed, setOverlayDismissed] = useState(false);

  const standard = useStandardChess(gameMode === "cpu" ? "cpu" : "2p");
  const fourPlayer = useFourPlayerChess(fourVsCpu);

  const gameResult = gameMode === "4p" ? fourPlayer.gameResult : standard.gameResult;

  useGameAnnouncer(gameResult, gameMode, fourVsCpu);

  const standardCaptured = useMemo(() => {
    const white: { type: "k" | "q" | "r" | "b" | "n" | "p" }[] = [];
    const black: { type: "k" | "q" | "r" | "b" | "n" | "p" }[] = [];
    for (const move of standard.chess.history({ verbose: true })) {
      if (!move.captured) continue;
      if (move.color === "w") black.push({ type: move.captured });
      else white.push({ type: move.captured });
    }
    return { white, black };
  }, [standard.chess]);

  const fourCapturedGroups = useMemo(() => {
    return ([0, 1, 2, 3] as const).map((id) => ({
      id: String(id),
      label: FOUR_PLAYER_NAMES[id],
      accent: FOUR_PLAYER_COLORS[id],
      pieces: fourPlayer.captured
        .filter((p) => p.player === id)
        .map((p) => ({
          type: p.type,
          color: FOUR_PLAYER_COLORS[p.player],
          outlined: true,
        })),
    }));
  }, [fourPlayer.captured]);

  const moveHistory = useMemo(() => {
    if (gameMode === "4p") return [];
    return standard.chess.history();
  }, [gameMode, standard.chess]);

  const showMateOverlay =
    !overlayDismissed &&
    (gameResult.kind === "checkmate" ||
      gameResult.kind === "stalemate" ||
      gameResult.kind === "draw" ||
      gameResult.kind === "four_win");

  function toggleVoice() {
    const next = !voiceOn;
    setVoiceOn(next);
    setVoiceEnabled(next);
    if (!next) stopSpeaking();
  }

  function handleChangeMode(next: GameMode) {
    setGameMode(next);
    setOverlayDismissed(false);
    stopSpeaking();
    if (next !== "4p") standard.reset();
    else fourPlayer.reset();
  }

  function handleNewGame() {
    setOverlayDismissed(false);
    stopSpeaking();
    if (gameMode === "4p") fourPlayer.reset();
    else standard.reset();
  }

  const status = gameMode === "4p" ? fourPlayer.status : standard.status;
  const announcerMode = gameMode === "4p" ? "4p" : gameMode;

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-page text-fg">
      <div className="pointer-events-none absolute inset-0 bg-grid-fine" aria-hidden />

      <header className="relative z-10 mx-auto flex max-w-[96rem] items-center justify-between gap-4 px-4 py-6 sm:px-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">Chess</h1>
          <span className="hidden h-4 w-px bg-border sm:block" />
          <span className="hidden text-sm text-fg-muted sm:inline">Play vs CPU, 2P, or 4P</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className="rounded-full border border-border bg-surface/85 px-4 py-2 text-sm font-medium text-fg-muted transition hover:border-accent hover:text-fg"
          >
            Home
          </Link>
          <button
            type="button"
            onClick={toggleVoice}
            className={[
              "rounded-full border px-4 py-2 text-sm font-medium transition",
              voiceOn
                ? "border-accent/60 bg-accent/10 text-accent"
                : "border-border bg-surface/85 text-fg-muted hover:border-accent hover:text-fg",
            ].join(" ")}
            aria-pressed={voiceOn}
          >
            {voiceOn ? "Voice on" : "Voice off"}
          </button>
          <button
            type="button"
            onClick={toggleMode}
            className="rounded-full border border-border bg-surface/85 px-4 py-2 text-sm font-medium text-fg-muted transition hover:border-accent hover:text-fg"
          >
            {themeMode === "dark" ? "Light" : "Dark"}
          </button>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex max-w-[96rem] flex-col items-center gap-8 px-4 pb-16 sm:px-8 lg:flex-row lg:items-start lg:justify-center">
        <div className="relative flex flex-col items-center gap-4">
          {gameResult.kind === "check" && gameMode !== "4p" && (
            <div className="animate-pulse rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              Check!
            </div>
          )}
          {gameMode === "4p" && fourPlayer.status.includes("is in check") && (
            <div className="animate-pulse rounded-full border border-amber-500/50 bg-amber-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
              Check!
            </div>
          )}

          {gameMode === "4p" ? (
            <FourPlayerBoard
              board={fourPlayer.board}
              selected={fourPlayer.selected}
              legalTargets={fourPlayer.legalTargets}
              lastMove={fourPlayer.lastMove}
              checkedSquares={fourPlayer.checkedSquares}
              turn={fourPlayer.turn}
              locked={fourVsCpu && (fourPlayer.thinking || fourPlayer.turn !== 0)}
              thinking={fourPlayer.thinking}
              vsCpu={fourVsCpu}
              onSquareClick={fourPlayer.onSquareClick}
            />
          ) : (
            <StandardBoard
              chess={standard.chess}
              selected={standard.selected}
              legalTargets={standard.legalTargets}
              lastMove={standard.lastMove}
              onSquareClick={standard.onSquareClick}
              inCheck={gameResult.kind === "check" ? gameResult.player : null}
              thinking={standard.thinking}
            />
          )}

          {gameMode === "4p" && (
            <div className="flex flex-wrap justify-center gap-2">
              {([0, 1, 2, 3] as const).map((id) => {
                const isTurn = fourPlayer.turn === id && !fourPlayer.eliminated.has(id);
                const color = FOUR_PLAYER_COLORS[id];
                return (
                  <span
                    key={id}
                    className={[
                      "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition",
                      fourPlayer.eliminated.has(id) ? "line-through opacity-35" : "",
                      isTurn ? "chess-turn-chip text-black" : "border-border text-fg-muted",
                    ].join(" ")}
                    style={
                      isTurn
                        ? {
                            ["--turn-color" as string]: color,
                            background: color,
                            borderColor: color,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full ring-1 ring-black/25"
                      style={{ background: isTurn ? "#111" : color }}
                    />
                    {FOUR_PLAYER_NAMES[id]}
                    {fourVsCpu ? (id === 0 ? " (you)" : " CPU") : ""}
                    {isTurn
                      ? fourVsCpu
                        ? id === 0
                          ? " · your turn"
                          : " · moving"
                        : " · turn"
                      : ""}
                  </span>
                );
              })}
            </div>
          )}

          <CapturedTray
            groups={
              gameMode === "4p"
                ? fourCapturedGroups
                : [
                    {
                      id: "w",
                      label: "White",
                      accent: "#e2e8f0",
                      pieces: standardCaptured.white.map((p) => ({
                        type: p.type,
                        color: "#f8fafc",
                        isLight: true,
                      })),
                    },
                    {
                      id: "b",
                      label: "Black",
                      accent: "#334155",
                      pieces: standardCaptured.black.map((p) => ({
                        type: p.type,
                        color: "#0f172a",
                        isLight: false,
                      })),
                    },
                  ]
            }
          />
        </div>

        <GamePanel
          mode={gameMode}
          status={status}
          statusColor={gameMode === "4p" ? FOUR_PLAYER_COLORS[fourPlayer.turn] : undefined}
          fourVsCpu={fourVsCpu}
          onToggleFourCpu={() => setFourVsCpu((on) => !on)}
          voiceOn={voiceOn}
          onToggleVoice={toggleVoice}
          onNewGame={handleNewGame}
          onChangeMode={handleChangeMode}
          moveHistory={moveHistory}
        />
      </main>

      {showMateOverlay && (
        <MateOverlay
          result={gameResult}
          mode={announcerMode}
          vsCpu={fourVsCpu}
          onNewGame={handleNewGame}
          onDismiss={() => setOverlayDismissed(true)}
        />
      )}
    </div>
  );
}

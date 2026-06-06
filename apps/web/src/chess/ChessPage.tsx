import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "@/design";
import { isVoiceEnabled, preloadVoices, setVoiceEnabled, stopSpeaking } from "./audio/announcer";
import { FourPlayerBoard } from "./components/FourPlayerBoard";
import { GamePanel } from "./components/GamePanel";
import { MateOverlay } from "./components/MateOverlay";
import { StandardBoard } from "./components/StandardBoard";
import { useFourPlayerChess } from "./fourPlayer/useFourPlayerChess";
import { useGameAnnouncer } from "./hooks/useGameAnnouncer";
import { useStandardChess } from "./standard/useStandardChess";
import type { GameMode } from "./types";

export function ChessPage() {
  const { mode: themeMode, toggleMode } = useTheme();
  const [gameMode, setGameMode] = useState<GameMode>("cpu");
  const [voiceOn, setVoiceOn] = useState(() => {
    preloadVoices();
    return isVoiceEnabled();
  });
  const [overlayDismissed, setOverlayDismissed] = useState(false);

  const standard = useStandardChess(gameMode === "cpu" ? "cpu" : "2p");
  const fourPlayer = useFourPlayerChess();

  const gameResult = gameMode === "4p" ? fourPlayer.gameResult : standard.gameResult;

  useGameAnnouncer(gameResult, gameMode);

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

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6 sm:px-10">
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

      <main className="relative z-10 mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 pb-16 sm:px-10 lg:flex-row lg:items-start lg:justify-center">
        <div className="relative flex flex-col items-center gap-4">
          {gameResult.kind === "check" && gameMode !== "4p" && (
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
              onSquareClick={fourPlayer.onSquareClick}
            />
          ) : (
            <StandardBoard
              chess={standard.chess}
              selected={standard.selected}
              legalTargets={standard.legalTargets}
              lastMove={standard.lastMove}
              onSquareClick={standard.onSquareClick}
              flipped={gameMode === "cpu"}
              inCheck={gameResult.kind === "check" ? gameResult.player : null}
            />
          )}

          {gameMode === "4p" && (
            <div className="flex flex-wrap justify-center gap-3 text-xs text-fg-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#f8fafc] ring-1 ring-border" /> White
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-red-500" /> Red
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-slate-800" /> Black
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full bg-blue-500" /> Blue
              </span>
            </div>
          )}
        </div>

        <GamePanel
          mode={gameMode}
          status={status}
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
          onNewGame={handleNewGame}
          onDismiss={() => setOverlayDismissed(true)}
        />
      )}
    </div>
  );
}

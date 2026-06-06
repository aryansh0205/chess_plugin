import { FaChessKing } from "react-icons/fa";
import type { GameResult } from "../gameResult";
import { resultSubtitle, resultTitle } from "../gameResult";

type Props = {
  result: GameResult;
  mode: "cpu" | "2p" | "4p";
  onNewGame: () => void;
  onDismiss?: () => void;
};

export function MateOverlay({ result, mode, onNewGame, onDismiss }: Props) {
  const title = resultTitle(result, mode);
  const subtitle = resultSubtitle(result, mode);

  if (!title || !subtitle) return null;

  const isWin = result.kind === "checkmate" && mode === "cpu" && result.winner === "w";
  const isFourWin = result.kind === "four_win";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-page/80 p-6 backdrop-blur-sm">
      <div
        className={[
          "relative w-full max-w-md overflow-hidden rounded-2xl border px-8 py-10 text-center shadow-2xl",
          isWin || isFourWin
            ? "border-accent/60 bg-surface"
            : "border-border bg-surface",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mate-title"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/15 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-accent/10 blur-2xl" />

        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent/40 bg-accent/10">
          <FaChessKing
            className={[
              "text-4xl",
              result.kind === "checkmate" && result.winner === "b" && mode === "cpu"
                ? "text-slate-700 dark:text-slate-300"
                : "text-accent",
            ].join(" ")}
          />
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-fg-muted">Game over</p>
        <h2 id="mate-title" className="mt-3 text-3xl font-bold tracking-tight text-fg">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-fg-muted">{subtitle}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onNewGame}
            className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 dark:text-slate-950"
          >
            Play again
          </button>
          {onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-full border border-border px-6 py-2.5 text-sm font-semibold text-fg-muted transition hover:border-accent hover:text-fg"
            >
              Review board
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

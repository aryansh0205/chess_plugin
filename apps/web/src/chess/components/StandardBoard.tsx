import { Chess, type Square } from "chess.js";
import type { StandardColor } from "../types";
import { PieceGlyph } from "./PieceGlyph";
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function findKingSquare(chess: Chess, color: StandardColor): Square | null {
  for (const row of chess.board()) {
    for (const piece of row) {
      if (piece?.type === "k" && piece.color === color) {
        return piece.square as Square;
      }
    }
  }
  return null;
}

type Props = {
  chess: Chess;
  selected: Square | null;
  legalTargets: Set<Square>;
  lastMove: { from: Square; to: Square } | null;
  onSquareClick: (sq: Square) => void;
  flipped?: boolean;
  inCheck?: StandardColor | null;
};

export function StandardBoard({
  chess,
  selected,
  legalTargets,
  lastMove,
  onSquareClick,
  flipped = false,
  inCheck = null,
}: Props) {
  const rows = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const kingInCheck = inCheck ? findKingSquare(chess, inCheck) : null;

  return (
    <div className="inline-block rounded-xl border-2 border-border bg-surface p-2 shadow-xl">
      <div className="grid grid-cols-8 gap-0">
        {rows.map((row) =>
          FILES.map((file, col) => {
            const square = `${file}${row + 1}` as Square;
            const isLight = (row + col) % 2 === 0;
            const piece = chess.get(square);
            const isSelected = selected === square;
            const isTarget = legalTargets.has(square);
            const isLast =
              lastMove && (lastMove.from === square || lastMove.to === square);
            const isKingChecked = kingInCheck === square;

            return (
              <button
                key={square}
                type="button"
                onClick={() => onSquareClick(square)}
                className={[
                  "relative flex h-12 w-12 items-center justify-center transition sm:h-14 sm:w-14 md:h-16 md:w-16",
                  isLight ? "bg-[#e8edf2] dark:bg-[#3d4f5f]" : "bg-[#7a9bb8] dark:bg-[#2a3d4d]",
                  isSelected && "ring-2 ring-inset ring-accent",
                  isKingChecked && "bg-red-500/35 ring-2 ring-inset ring-red-500/70",
                  isLast && !isKingChecked && "bg-accent/25",
                  isTarget && "after:absolute after:h-3 after:w-3 after:rounded-full after:bg-accent/70",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={square}
              >
                {piece && (
                  <PieceGlyph
                    type={piece.type as "k" | "q" | "r" | "b" | "n" | "p"}
                    color={piece.color === "w" ? "#f8fafc" : "#0f172a"}
                    isLight={piece.color === "w"}
                  />
                )}
              </button>
            );
          }),
        )}
      </div>
    </div>
  );
}

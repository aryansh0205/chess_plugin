import { BOARD_SIZE, isActiveSquare, type FourBoard } from "../fourPlayer/board";
import type { FourMove } from "../fourPlayer/moves";
import { FOUR_PLAYER_COLORS } from "../types";
import { PieceGlyph } from "./PieceGlyph";

type Props = {
  board: FourBoard;
  selected: { row: number; col: number } | null;
  legalTargets: Set<string>;
  lastMove: FourMove | null;
  onSquareClick: (row: number, col: number) => void;
};

export function FourPlayerBoard({
  board,
  selected,
  legalTargets,
  lastMove,
  onSquareClick,
}: Props) {
  return (
    <div className="inline-block rounded-xl border-2 border-border bg-surface p-2 shadow-xl">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
        }}
      >
        {Array.from({ length: BOARD_SIZE }, (_, row) =>
          Array.from({ length: BOARD_SIZE }, (_, col) => {
            const active = isActiveSquare(row, col);
            if (!active) {
              return (
                <div
                  key={`${row}-${col}`}
                  className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8"
                />
              );
            }

            const piece = board[row][col];
            const isLight = (row + col) % 2 === 0;
            const key = `${row},${col}`;
            const isSelected = selected?.row === row && selected?.col === col;
            const isTarget = legalTargets.has(key);
            const isLast =
              lastMove &&
              ((lastMove.from.row === row && lastMove.from.col === col) ||
                (lastMove.to.row === row && lastMove.to.col === col));

            return (
              <button
                key={key}
                type="button"
                onClick={() => onSquareClick(row, col)}
                className={[
                  "relative flex h-6 w-6 items-center justify-center transition sm:h-7 sm:w-7 md:h-8 md:w-8",
                  isLight ? "bg-[#e8edf2] dark:bg-[#3d4f5f]" : "bg-[#7a9bb8] dark:bg-[#2a3d4d]",
                  isSelected && "ring-2 ring-inset ring-accent",
                  isLast && "bg-accent/25",
                  isTarget && "after:absolute after:h-2 after:w-2 after:rounded-full after:bg-accent/70",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {piece && (
                  <PieceGlyph
                    type={piece.type}
                    color={FOUR_PLAYER_COLORS[piece.player]}
                    isLight={piece.player === 0}
                    size="sm"
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

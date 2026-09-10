import { useEffect, useRef, useState } from "react";
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

function squareCoords(sq: Square) {
  return { col: sq.charCodeAt(0) - 97, row: Number(sq[1]) - 1 };
}

type Props = {
  chess: Chess;
  selected: Square | null;
  legalTargets: Set<Square>;
  lastMove: { from: Square; to: Square } | null;
  onSquareClick: (sq: Square) => void;
  flipped?: boolean;
  inCheck?: StandardColor | null;
  thinking?: boolean;
};

export function StandardBoard({
  chess,
  selected,
  legalTargets,
  lastMove,
  onSquareClick,
  flipped = false,
  inCheck = null,
  thinking = false,
}: Props) {
  const rows = flipped ? [0, 1, 2, 3, 4, 5, 6, 7] : [7, 6, 5, 4, 3, 2, 1, 0];
  const kingInCheck = inCheck ? findKingSquare(chess, inCheck) : null;
  const turn = chess.turn();
  const [animKey, setAnimKey] = useState(0);
  const prevMove = useRef(lastMove);

  useEffect(() => {
    if (lastMove && lastMove !== prevMove.current) setAnimKey((k) => k + 1);
    prevMove.current = lastMove;
  }, [lastMove]);

  let moveDx = "0px";
  let moveDy = "0px";
  if (lastMove) {
    const from = squareCoords(lastMove.from);
    const to = squareCoords(lastMove.to);
    const fromY = flipped ? from.row : 7 - from.row;
    const toY = flipped ? to.row : 7 - to.row;
    moveDx = `calc(${from.col - to.col} * 100%)`;
    moveDy = `calc(${fromY - toY} * 100%)`;
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-2">
        <TurnChip label="White" color="#f8fafc" active={turn === "w"} light />
        <TurnChip
          label="Black"
          color="#0f172a"
          active={turn === "b"}
          thinking={thinking && turn === "b"}
        />
      </div>

      <div
        className="inline-block rounded-xl border-2 bg-surface p-2 shadow-xl"
        style={{
          borderColor: turn === "w" ? "#e2e8f0" : "#334155",
          boxShadow:
            turn === "w"
              ? "0 0 0 1px rgba(248,250,252,0.35), 0 0 22px rgba(248,250,252,0.18)"
              : "0 0 0 1px rgba(15,23,42,0.45), 0 0 22px rgba(15,23,42,0.28)",
        }}
      >
        <div className="grid grid-cols-8 gap-0">
          {rows.map((row) =>
            FILES.map((file, col) => {
              const square = `${file}${row + 1}` as Square;
              const isLight = (row + col) % 2 === 0;
              const piece = chess.get(square);
              const isSelected = selected === square;
              const isTarget = legalTargets.has(square);
              const isLastFrom = lastMove?.from === square;
              const isLastTo = lastMove?.to === square;
              const isKingChecked = kingInCheck === square;
              const isMoving = Boolean(isLastTo && piece);

              return (
                <button
                  key={square}
                  type="button"
                  onClick={() => onSquareClick(square)}
                  className={[
                    "relative flex h-12 w-12 items-center justify-center sm:h-14 sm:w-14 md:h-16 md:w-16",
                    isMoving && "z-20 overflow-visible",
                    isLight ? "bg-[#e8edf2] dark:bg-[#3d4f5f]" : "bg-[#7a9bb8] dark:bg-[#2a3d4d]",
                    isSelected && "ring-2 ring-inset ring-accent",
                    isKingChecked && "bg-red-500/35 ring-2 ring-inset ring-red-500/70",
                    (isLastFrom || isLastTo) && !isKingChecked && "bg-accent/25",
                    isTarget && "after:absolute after:h-3 after:w-3 after:rounded-full after:bg-accent/70",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  aria-label={square}
                >
                  {piece && (
                    <span
                      key={isMoving ? `slide-${animKey}` : square}
                      className={[
                        "absolute inset-0 flex items-center justify-center",
                        isMoving && "chess-piece-slide",
                        isSelected && "scale-110",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={
                        isMoving
                          ? {
                              ["--move-dx" as string]: moveDx,
                              ["--move-dy" as string]: moveDy,
                            }
                          : undefined
                      }
                    >
                      <PieceGlyph
                        type={piece.type as "k" | "q" | "r" | "b" | "n" | "p"}
                        color={piece.color === "w" ? "#f8fafc" : "#0f172a"}
                        isLight={piece.color === "w"}
                      />
                    </span>
                  )}
                </button>
              );
            }),
          )}
        </div>
      </div>
    </div>
  );
}

function TurnChip({
  label,
  color,
  active,
  thinking,
  light = false,
}: {
  label: string;
  color: string;
  active: boolean;
  thinking?: boolean;
  light?: boolean;
}) {
  return (
    <span
      className={[
        "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        active ? "chess-turn-chip" : "opacity-45",
      ].join(" ")}
      style={{
        ["--turn-color" as string]: color,
        background: active ? color : "transparent",
        color: active ? (light ? "#0f172a" : "#f8fafc") : undefined,
        border: `1px solid ${color}`,
      }}
    >
      {label}
      {active ? (thinking ? " · cpu" : " · turn") : ""}
    </span>
  );
}

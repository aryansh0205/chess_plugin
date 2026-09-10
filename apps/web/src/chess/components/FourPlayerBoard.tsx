import { useEffect, useRef, useState } from "react";
import { ARM, BOARD_SIZE, isActiveSquare, type FourBoard } from "../fourPlayer/board";
import type { FourMove } from "../fourPlayer/moves";
import { FOUR_PLAYER_COLORS, FOUR_PLAYER_NAMES, type FourPlayerId } from "../types";
import { PieceGlyph } from "./PieceGlyph";

type Props = {
  board: FourBoard;
  selected: { row: number; col: number } | null;
  legalTargets: Set<string>;
  lastMove: FourMove | null;
  checkedSquares?: Set<string>;
  turn?: FourPlayerId;
  locked?: boolean;
  thinking?: boolean;
  vsCpu?: boolean;
  onSquareClick: (row: number, col: number) => void;
};

const SQ = "h-10 w-10 sm:h-12 sm:w-12 md:h-[3.35rem] md:w-[3.35rem] lg:h-14 lg:w-14";

const PLUS_CLIP = `polygon(${[
  `${(ARM / BOARD_SIZE) * 100}% 0%`,
  `${((BOARD_SIZE - ARM) / BOARD_SIZE) * 100}% 0%`,
  `${((BOARD_SIZE - ARM) / BOARD_SIZE) * 100}% ${(ARM / BOARD_SIZE) * 100}%`,
  `100% ${(ARM / BOARD_SIZE) * 100}%`,
  `100% ${((BOARD_SIZE - ARM) / BOARD_SIZE) * 100}%`,
  `${((BOARD_SIZE - ARM) / BOARD_SIZE) * 100}% ${((BOARD_SIZE - ARM) / BOARD_SIZE) * 100}%`,
  `${((BOARD_SIZE - ARM) / BOARD_SIZE) * 100}% 100%`,
  `${(ARM / BOARD_SIZE) * 100}% 100%`,
  `${(ARM / BOARD_SIZE) * 100}% ${((BOARD_SIZE - ARM) / BOARD_SIZE) * 100}%`,
  `0% ${((BOARD_SIZE - ARM) / BOARD_SIZE) * 100}%`,
  `0% ${(ARM / BOARD_SIZE) * 100}%`,
  `${(ARM / BOARD_SIZE) * 100}% ${(ARM / BOARD_SIZE) * 100}%`,
].join(", ")})`;

const LABELS: { player: FourPlayerId; className: string }[] = [
  { player: 2, className: "left-1/2 top-0 -translate-x-1/2" },
  { player: 0, className: "bottom-0 left-1/2 -translate-x-1/2" },
  { player: 1, className: "left-0 top-1/2 -translate-y-1/2 -rotate-90" },
  { player: 3, className: "right-0 top-1/2 -translate-y-1/2 rotate-90" },
];

function isCampSquare(row: number, col: number, player: FourPlayerId): boolean {
  switch (player) {
    case 0:
      return row >= 11 && col >= 3 && col <= 10;
    case 1:
      return col <= 2 && row >= 3 && row <= 10;
    case 2:
      return row <= 2 && col >= 3 && col <= 10;
    case 3:
      return col >= 11 && row >= 3 && row <= 10;
  }
}

function useAnimKey(move: FourMove | null): number {
  const [key, setKey] = useState(0);
  const prev = useRef(move);
  useEffect(() => {
    if (move && move !== prev.current) setKey((k) => k + 1);
    prev.current = move;
  }, [move]);
  return key;
}

export function FourPlayerBoard({
  board,
  selected,
  legalTargets,
  lastMove,
  checkedSquares,
  turn,
  locked = false,
  thinking = false,
  vsCpu = true,
  onSquareClick,
}: Props) {
  const animKey = useAnimKey(lastMove);
  const turnColor = turn !== undefined ? FOUR_PLAYER_COLORS[turn] : undefined;

  return (
    <div className={`relative inline-block p-9 sm:p-11 ${locked ? "pointer-events-none" : ""}`}>
      {LABELS.map(({ player, className }) => {
        const active = turn === player;
        return (
          <span
            key={player}
            className={["pointer-events-none absolute z-10", className].join(" ")}
          >
            <span
              className={[
                "inline-block rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] sm:text-xs",
                active ? "chess-turn-label text-black" : "bg-black/25 text-white/80",
              ].join(" ")}
              style={
                active
                  ? {
                      background: FOUR_PLAYER_COLORS[player],
                      ["--turn-color" as string]: FOUR_PLAYER_COLORS[player],
                      boxShadow: `0 0 0 3px ${FOUR_PLAYER_COLORS[player]}55, 0 0 18px ${FOUR_PLAYER_COLORS[player]}99`,
                    }
                  : undefined
              }
            >
              {FOUR_PLAYER_NAMES[player]}
              {active ? (vsCpu && thinking && player !== 0 ? " · cpu" : " · turn") : ""}
            </span>
          </span>
        );
      })}

      <div
        className="bg-[#3a3a3a] p-[3px] dark:bg-[#1f1f1f]"
        style={{
          clipPath: PLUS_CLIP,
          boxShadow: turnColor ? `0 0 0 2px ${turnColor}, 0 0 22px ${turnColor}66` : undefined,
        }}
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
            clipPath: PLUS_CLIP,
          }}
        >
          {Array.from({ length: BOARD_SIZE }, (_, row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) => {
              const active = isActiveSquare(row, col);
              if (!active) {
                return (
                  <div
                    key={`${row}-${col}`}
                    className={SQ}
                  />
                );
              }

              const piece = board[row][col];
              const isLight = (row + col) % 2 === 0;
              const key = `${row},${col}`;
              const isSelected = selected?.row === row && selected?.col === col;
              const isTarget = legalTargets.has(key);
              const isChecked = checkedSquares?.has(key);
              const isLastFrom =
                lastMove && lastMove.from.row === row && lastMove.from.col === col;
              const isLastTo = lastMove && lastMove.to.row === row && lastMove.to.col === col;
              const isMoving = Boolean(isLastTo && piece);
              const inTurnCamp = turn !== undefined && isCampSquare(row, col, turn);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSquareClick(row, col)}
                  className={[
                    "relative flex items-center justify-center",
                    SQ,
                    isMoving && "z-20 overflow-visible",
                    isLight ? "bg-[#f4f4f4] dark:bg-[#dcdcdc]" : "bg-[#c8c8c8] dark:bg-[#9a9a9a]",
                    isSelected && "ring-2 ring-inset ring-accent",
                    isChecked && "bg-red-500/40 ring-2 ring-inset ring-red-600/80",
                    (isLastFrom || isLastTo) && !isChecked && "bg-amber-300/55 dark:bg-amber-400/45",
                    isTarget &&
                      !piece &&
                      "after:absolute after:h-2 after:w-2 after:rounded-full after:bg-accent/80 sm:after:h-2.5 sm:after:w-2.5",
                    isTarget && piece && "ring-2 ring-inset ring-accent/80",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    inTurnCamp && !isLastFrom && !isLastTo && !isChecked
                      ? { boxShadow: `inset 0 0 0 2px ${turnColor}` }
                      : undefined
                  }
                >
                  {isLastTo && lastMove?.capture && (
                    <span key={`burst-${animKey}`} className="chess-capture-burst" />
                  )}
                  {piece && (
                    <span
                      key={isMoving ? `slide-${animKey}` : key}
                      className={[
                        "absolute inset-0 flex items-center justify-center",
                        isMoving && "chess-piece-slide",
                        isSelected && "scale-110",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      style={
                        isMoving && lastMove
                          ? {
                              ["--move-dx" as string]: `calc(${lastMove.from.col - col} * 100%)`,
                              ["--move-dy" as string]: `calc(${lastMove.from.row - row} * 100%)`,
                            }
                          : undefined
                      }
                    >
                      <PieceGlyph
                        type={piece.type}
                        color={FOUR_PLAYER_COLORS[piece.player]}
                        outlined
                        size="4p"
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

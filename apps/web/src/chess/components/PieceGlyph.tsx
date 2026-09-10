import {
  FaChessBishop,
  FaChessKing,
  FaChessKnight,
  FaChessPawn,
  FaChessQueen,
  FaChessRook,
} from "react-icons/fa";
import type { PieceType } from "../types";

const PIECE_ICONS = {
  k: FaChessKing,
  q: FaChessQueen,
  r: FaChessRook,
  b: FaChessBishop,
  n: FaChessKnight,
  p: FaChessPawn,
} as const;

type Props = {
  type: PieceType;
  color: string;
  isLight?: boolean;
  outlined?: boolean;
  size?: "sm" | "md" | "lg" | "4p";
};

export function PieceGlyph({ type, color, isLight = true, outlined = false, size = "md" }: Props) {
  const Icon = PIECE_ICONS[type];
  const sizeClass =
    size === "sm"
      ? "text-xl"
      : size === "4p"
        ? "text-2xl sm:text-3xl md:text-[2rem] lg:text-4xl"
        : size === "lg"
          ? "text-5xl"
          : "text-3xl sm:text-4xl";

  const outlineFilter =
    "drop-shadow(0.6px 0.6px 0 #1a1a1a) drop-shadow(-0.6px -0.6px 0 #1a1a1a) drop-shadow(0.6px -0.6px 0 #1a1a1a) drop-shadow(-0.6px 0.6px 0 #1a1a1a)";

  return (
    <Icon
      className={`${sizeClass} select-none transition-transform`}
      style={{
        color,
        filter: outlined
          ? outlineFilter
          : isLight
            ? "drop-shadow(0 1px 2px rgba(0,0,0,0.45))"
            : "drop-shadow(0 1px 2px rgba(255,255,255,0.12)) drop-shadow(0 0 1px rgba(0,0,0,0.9))",
      }}
      aria-hidden
    />
  );
}

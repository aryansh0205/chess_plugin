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
  size?: "sm" | "md" | "lg";
};

export function PieceGlyph({ type, color, isLight = true, size = "md" }: Props) {
  const Icon = PIECE_ICONS[type];
  const sizeClass = size === "sm" ? "text-xl" : size === "lg" ? "text-5xl" : "text-3xl sm:text-4xl";

  return (
    <Icon
      className={`${sizeClass} select-none transition-transform`}
      style={{
        color,
        filter: isLight
          ? "drop-shadow(0 1px 2px rgba(0,0,0,0.45))"
          : "drop-shadow(0 1px 2px rgba(255,255,255,0.12)) drop-shadow(0 0 1px rgba(0,0,0,0.9))",
      }}
      aria-hidden
    />
  );
}

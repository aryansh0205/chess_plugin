export type GameMode = "cpu" | "2p" | "4p";

export type StandardColor = "w" | "b";

export type FourPlayerId = 0 | 1 | 2 | 3;

export const FOUR_PLAYER_NAMES: Record<FourPlayerId, string> = {
  0: "White",
  1: "Red",
  2: "Black",
  3: "Blue",
};

export const FOUR_PLAYER_COLORS: Record<FourPlayerId, string> = {
  0: "#f8fafc",
  1: "#ef4444",
  2: "#1e293b",
  3: "#3b82f6",
};

export type PieceType = "k" | "q" | "r" | "b" | "n" | "p";

export type StandardPiece = {
  type: PieceType;
  color: StandardColor;
};

export type Square = { row: number; col: number };

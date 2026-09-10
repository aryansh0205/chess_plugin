export type GameMode = "cpu" | "2p" | "4p";

export type StandardColor = "w" | "b";

export type FourPlayerId = 0 | 1 | 2 | 3;

/** South, West, North, East — clockwise from the bottom of the board. */
export const FOUR_PLAYER_NAMES: Record<FourPlayerId, string> = {
  0: "Yellow",
  1: "Blue",
  2: "Red",
  3: "Green",
};

export const FOUR_PLAYER_COLORS: Record<FourPlayerId, string> = {
  0: "#e8c21a",
  1: "#2f78e8",
  2: "#e23d3d",
  3: "#2aa84a",
};

export type PieceType = "k" | "q" | "r" | "b" | "n" | "p";

export type StandardPiece = {
  type: PieceType;
  color: StandardColor;
};

export type Square = { row: number; col: number };

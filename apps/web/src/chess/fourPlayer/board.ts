import type { FourPlayerId, PieceType, Square } from "../types";

export const BOARD_SIZE = 14;

export type FourPiece = {
  type: PieceType;
  player: FourPlayerId;
};

export type FourBoard = (FourPiece | null)[][];

const CENTER = { r0: 3, r1: 10, c0: 3, c1: 10 };

export function isActiveSquare(row: number, col: number): boolean {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;

  const inCenter =
    row >= CENTER.r0 && row <= CENTER.r1 && col >= CENTER.c0 && col <= CENTER.c1;
  const inNorth = row <= 2 && col >= 5 && col <= 8;
  const inSouth = row >= 11 && col <= 8 && col >= 5;
  const inWest = col <= 2 && row >= 5 && row <= 8;
  const inEast = col >= 11 && row >= 5 && row <= 8;

  return inCenter || inNorth || inSouth || inWest || inEast;
}

export function createInitialBoard(): FourBoard {
  const board: FourBoard = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );

  const place = (row: number, col: number, player: FourPlayerId, type: PieceType) => {
    if (isActiveSquare(row, col)) board[row][col] = { type, player };
  };

  // South (White) — rows 11-13
  const southPieces: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  southPieces.forEach((type, i) => place(13, 5 + i, 0, type));
  for (let c = 5; c <= 8; c++) place(12, c, 0, "p");
  place(11, 6, 0, "p");
  place(11, 7, 0, "p");

  // North (Black) — rows 0-2
  const northPieces: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  northPieces.forEach((type, i) => place(0, 5 + i, 2, type));
  for (let c = 5; c <= 8; c++) place(1, c, 2, "p");
  place(2, 6, 2, "p");
  place(2, 7, 2, "p");

  // West (Red) — cols 0-2
  const westPieces: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  westPieces.forEach((type, i) => place(5 + i, 0, 1, type));
  for (let r = 5; r <= 8; r++) place(r, 1, 1, "p");
  place(6, 2, 1, "p");
  place(7, 2, 1, "p");

  // East (Blue) — cols 11-13
  const eastPieces: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  eastPieces.forEach((type, i) => place(5 + i, 13, 3, type));
  for (let r = 5; r <= 8; r++) place(r, 12, 3, "p");
  place(6, 11, 3, "p");
  place(7, 11, 3, "p");

  return board;
}

export function playerDirection(player: FourPlayerId): { dr: number; dc: number } {
  switch (player) {
    case 0:
      return { dr: -1, dc: 0 };
    case 2:
      return { dr: 1, dc: 0 };
    case 1:
      return { dr: 0, dc: 1 };
    case 3:
      return { dr: 0, dc: -1 };
  }
}

export function squareKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function parseSquare(key: string): Square {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

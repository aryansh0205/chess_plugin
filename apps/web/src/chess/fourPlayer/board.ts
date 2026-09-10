import type { FourPlayerId, PieceType, Square } from "../types";

export const BOARD_SIZE = 14;
export const ARM = 3;
export const FILE_START = ARM;
export const FILE_END = BOARD_SIZE - ARM - 1;

export type FourPiece = {
  type: PieceType;
  player: FourPlayerId;
};

export type FourBoard = (FourPiece | null)[][];

/** Plus-shaped 14×14 board: the four 3×3 corners are unplayable (160 squares). */
export function isActiveSquare(row: number, col: number): boolean {
  if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) return false;
  const inNw = row < ARM && col < ARM;
  const inNe = row < ARM && col > FILE_END;
  const inSw = row > FILE_END && col < ARM;
  const inSe = row > FILE_END && col > FILE_END;
  return !inNw && !inNe && !inSw && !inSe;
}

export function playerDirection(player: FourPlayerId): { dr: number; dc: number } {
  switch (player) {
    case 0:
      return { dr: -1, dc: 0 };
    case 1:
      return { dr: 0, dc: 1 };
    case 2:
      return { dr: 1, dc: 0 };
    case 3:
      return { dr: 0, dc: -1 };
  }
}

export function isPawnPromotion(player: FourPlayerId, row: number, col: number): boolean {
  const { dr, dc } = playerDirection(player);
  return !isActiveSquare(row + dr, col + dc);
}

export function createInitialBoard(): FourBoard {
  const board: FourBoard = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );

  const place = (row: number, col: number, player: FourPlayerId, type: PieceType) => {
    board[row][col] = { type, player };
  };

  // From each player's left-to-right while facing the center: R N B Q K B N R
  const fromLeft: PieceType[] = ["r", "n", "b", "q", "k", "b", "n", "r"];
  const files = Array.from({ length: 8 }, (_, i) => FILE_START + i);

  // Yellow (south) — screen left → right
  fromLeft.forEach((type, i) => place(BOARD_SIZE - 1, files[i], 0, type));
  files.forEach((c) => place(BOARD_SIZE - 2, c, 0, "p"));

  // Red (north) — their left is screen-right, so reverse across the rank
  [...fromLeft].reverse().forEach((type, i) => place(0, files[i], 2, type));
  files.forEach((c) => place(1, c, 2, "p"));

  // Blue (west) — their left is screen-bottom, so reverse down the file
  [...fromLeft].reverse().forEach((type, i) => place(files[i], 0, 1, type));
  files.forEach((r) => place(r, 1, 1, "p"));

  // Green (east) — their left is screen-top
  fromLeft.forEach((type, i) => place(files[i], BOARD_SIZE - 1, 3, type));
  files.forEach((r) => place(r, BOARD_SIZE - 2, 3, "p"));

  return board;
}

export function findKing(
  board: FourBoard,
  player: FourPlayerId,
): { row: number; col: number } | null {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const p = board[r][c];
      if (p?.type === "k" && p.player === player) return { row: r, col: c };
    }
  }
  return null;
}

export function removePlayerPieces(board: FourBoard, player: FourPlayerId): FourBoard {
  return board.map((row) => row.map((cell) => (cell?.player === player ? null : cell)));
}

export function squareKey(row: number, col: number): string {
  return `${row},${col}`;
}

export function parseSquare(key: string): Square {
  const [row, col] = key.split(",").map(Number);
  return { row, col };
}

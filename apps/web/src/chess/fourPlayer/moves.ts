import type { FourPlayerId, PieceType } from "../types";
import {
  type FourBoard,
  type FourPiece,
  isActiveSquare,
  playerDirection,
  squareKey,
} from "./board";

export type FourMove = {
  from: { row: number; col: number };
  to: { row: number; col: number };
  capture?: FourPiece;
  promotion?: PieceType;
};

function pieceAt(board: FourBoard, row: number, col: number): FourPiece | null {
  if (!isActiveSquare(row, col)) return null;
  return board[row][col];
}

function isEnemy(piece: FourPiece, player: FourPlayerId): boolean {
  return piece.player !== player;
}

function rayMoves(
  board: FourBoard,
  row: number,
  col: number,
  player: FourPlayerId,
  directions: [number, number][],
): FourMove[] {
  const moves: FourMove[] = [];
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (isActiveSquare(r, c)) {
      const target = pieceAt(board, r, c);
      if (!target) {
        moves.push({ from: { row, col }, to: { row: r, col: c } });
      } else {
        if (isEnemy(target, player)) {
          moves.push({ from: { row, col }, to: { row: r, col: c }, capture: target });
        }
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

function knightMoves(board: FourBoard, row: number, col: number, player: FourPlayerId): FourMove[] {
  const jumps: [number, number][] = [
    [-2, -1],
    [-2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
    [2, -1],
    [2, 1],
  ];
  const moves: FourMove[] = [];
  for (const [dr, dc] of jumps) {
    const r = row + dr;
    const c = col + dc;
    if (!isActiveSquare(r, c)) continue;
    const target = pieceAt(board, r, c);
    if (!target || isEnemy(target, player)) {
      moves.push({ from: { row, col }, to: { row: r, col: c }, capture: target ?? undefined });
    }
  }
  return moves;
}

function kingMoves(board: FourBoard, row: number, col: number, player: FourPlayerId): FourMove[] {
  const directions: [number, number][] = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];
  const moves: FourMove[] = [];
  for (const [dr, dc] of directions) {
    const r = row + dr;
    const c = col + dc;
    if (!isActiveSquare(r, c)) continue;
    const target = pieceAt(board, r, c);
    if (!target || isEnemy(target, player)) {
      moves.push({ from: { row, col }, to: { row: r, col: c }, capture: target ?? undefined });
    }
  }
  return moves;
}

function pawnMoves(board: FourBoard, row: number, col: number, player: FourPlayerId): FourMove[] {
  const { dr, dc } = playerDirection(player);
  const moves: FourMove[] = [];
  const forward = { row: row + dr, col: col + dc };
  const startRow = player === 0 ? 12 : player === 2 ? 1 : null;
  const startCol = player === 1 ? 1 : player === 3 ? 12 : null;

  if (isActiveSquare(forward.row, forward.col) && !pieceAt(board, forward.row, forward.col)) {
    moves.push({ from: { row, col }, to: forward });
    const isStart =
      (startRow !== null && row === startRow) || (startCol !== null && col === startCol);
    const double = { row: row + dr * 2, col: col + dc * 2 };
    if (isStart && isActiveSquare(double.row, double.col) && !pieceAt(board, double.row, double.col)) {
      moves.push({ from: { row, col }, to: double });
    }
  }

  const captures: [number, number][] =
    dc === 0
      ? [
          [dr, -1],
          [dr, 1],
        ]
      : [
          [-1, dc],
          [1, dc],
        ];

  for (const [cdr, cdc] of captures) {
    const r = row + cdr;
    const c = col + cdc;
    if (!isActiveSquare(r, c)) continue;
    const target = pieceAt(board, r, c);
    if (target && isEnemy(target, player)) {
      moves.push({ from: { row, col }, to: { row: r, col: c }, capture: target });
    }
  }

  return moves;
}

function pieceMoves(
  board: FourBoard,
  row: number,
  col: number,
  piece: FourPiece,
): FourMove[] {
  const { type, player } = piece;
  switch (type) {
    case "p":
      return pawnMoves(board, row, col, player);
    case "n":
      return knightMoves(board, row, col, player);
    case "k":
      return kingMoves(board, row, col, player);
    case "b":
      return rayMoves(board, row, col, player, [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
      ]);
    case "r":
      return rayMoves(board, row, col, player, [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]);
    case "q":
      return rayMoves(board, row, col, player, [
        [-1, -1],
        [-1, 1],
        [1, -1],
        [1, 1],
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ]);
  }
}

function findKing(board: FourBoard, player: FourPlayerId): { row: number; col: number } | null {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const p = board[r][c];
      if (p?.type === "k" && p.player === player) return { row: r, col: c };
    }
  }
  return null;
}

function isSquareAttacked(
  board: FourBoard,
  row: number,
  col: number,
  byPlayer: FourPlayerId,
): boolean {
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const piece = board[r][c];
      if (!piece || piece.player !== byPlayer) continue;
      const pseudo = pieceMoves(board, r, c, piece);
      if (pseudo.some((m) => m.to.row === row && m.to.col === col)) return true;
    }
  }
  return false;
}

function applyMove(board: FourBoard, move: FourMove): FourBoard {
  const next = board.map((row) => [...row]);
  const piece = next[move.from.row][move.from.col];
  if (!piece) return next;
  next[move.from.row][move.from.col] = null;
  next[move.to.row][move.to.col] = move.promotion
    ? { ...piece, type: move.promotion }
    : { ...piece };
  return next;
}

export function getLegalMoves(board: FourBoard, player: FourPlayerId): FourMove[] {
  const pseudo: FourMove[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const piece = board[r][c];
      if (piece?.player === player) {
        pseudo.push(...pieceMoves(board, r, c, piece));
      }
    }
  }

  const kingPos = findKing(board, player);
  if (!kingPos) return [];

  const legal: FourMove[] = [];
  for (const move of pseudo) {
    const next = applyMove(board, move);
    const newKing = findKing(next, player);
    if (!newKing) continue;
    const attacked = [0, 1, 2, 3]
      .filter((p) => p !== player && findKing(next, p as FourPlayerId))
      .some((p) => isSquareAttacked(next, newKing.row, newKing.col, p as FourPlayerId));
    if (!attacked) legal.push(move);
  }
  return legal;
}

export function moveKey(move: FourMove): string {
  return `${squareKey(move.from.row, move.from.col)}-${squareKey(move.to.row, move.to.col)}`;
}

export function isKingCaptured(board: FourBoard, player: FourPlayerId): boolean {
  return findKing(board, player) === null;
}

export function nextPlayer(current: FourPlayerId, eliminated: Set<FourPlayerId>): FourPlayerId {
  let next = ((current + 1) % 4) as FourPlayerId;
  let guard = 0;
  while (eliminated.has(next) && guard < 4) {
    next = ((next + 1) % 4) as FourPlayerId;
    guard++;
  }
  return next;
}

import type { FourPlayerId } from "../types";
import {
  BOARD_SIZE,
  findKing,
  type FourBoard,
} from "./board";
import {
  getLegalMoves,
  isInCheck,
  isSquareAttacked,
  playMove,
  type FourMove,
} from "./moves";

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

function livingPlayers(board: FourBoard): FourPlayerId[] {
  return ([0, 1, 2, 3] as FourPlayerId[]).filter((p) => findKing(board, p));
}

function pawnProgress(player: FourPlayerId, row: number, col: number): number {
  switch (player) {
    case 0:
      return Math.max(0, 12 - row);
    case 1:
      return Math.max(0, col - 1);
    case 2:
      return Math.max(0, row - 1);
    case 3:
      return Math.max(0, 12 - col);
  }
}

function onBackRank(player: FourPlayerId, row: number, col: number): boolean {
  switch (player) {
    case 0:
      return row === BOARD_SIZE - 1;
    case 1:
      return col === 0;
    case 2:
      return row === 0;
    case 3:
      return col === BOARD_SIZE - 1;
  }
}

function evaluate(board: FourBoard, me: FourPlayerId): number {
  if (!findKing(board, me)) return -100_000;

  const living = livingPlayers(board);
  if (living.length === 1) return 100_000;

  let score = 0;
  const enemies = living.filter((p) => p !== me);

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const piece = board[r][c];
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] ?? 0;
      if (piece.player === me) {
        score += value;
        if (piece.type === "p") score += pawnProgress(me, r, c) * 10;
        if ((piece.type === "n" || piece.type === "b") && !onBackRank(me, r, c)) score += 18;
        if (r >= 5 && r <= 8 && c >= 5 && c <= 8) score += 6;
      } else {
        score -= value * 0.38;
      }
    }
  }

  if (isInCheck(board, me)) score -= 220;
  for (const enemy of enemies) {
    if (isInCheck(board, enemy)) score += 55;
  }

  return score;
}

function destinationDanger(board: FourBoard, me: FourPlayerId, move: FourMove): number {
  const piece = board[move.to.row][move.to.col];
  if (!piece || piece.player !== me) return 0;
  const value = PIECE_VALUES[piece.type] ?? 0;
  if (value <= 0) return 0;

  const enemies = livingPlayers(board).filter((p) => p !== me);
  const attacked = enemies.some((p) => isSquareAttacked(board, move.to.row, move.to.col, p));
  if (!attacked) return 0;
  return value * 0.55;
}

function orderMoves(moves: FourMove[]): FourMove[] {
  return [...moves].sort((a, b) => {
    const aCap = a.capture ? (PIECE_VALUES[a.capture.type] ?? 0) + (a.capture.type === "k" ? 800 : 0) : 0;
    const bCap = b.capture ? (PIECE_VALUES[b.capture.type] ?? 0) + (b.capture.type === "k" ? 800 : 0) : 0;
    return bCap - aCap;
  });
}

export function getBestFourMove(
  board: FourBoard,
  player: FourPlayerId,
  eliminated: Set<FourPlayerId>,
): FourMove | null {
  const moves = orderMoves(getLegalMoves(board, player));
  if (moves.length === 0) return null;

  let best = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const next = playMove(board, player, eliminated, move);
    if (!next) continue;
    const score =
      evaluate(next.board, player) -
      destinationDanger(next.board, player, move) +
      Math.random() * 10;
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }

  return best;
}


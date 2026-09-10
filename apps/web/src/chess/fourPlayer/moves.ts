import type { FourPlayerId, PieceType } from "../types";
import {
  type FourBoard,
  type FourPiece,
  findKing,
  isActiveSquare,
  isPawnPromotion,
  playerDirection,
  removePlayerPieces,
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

function withPromotion(
  move: FourMove,
  player: FourPlayerId,
  type: PieceType,
): FourMove {
  if (type !== "p" || !isPawnPromotion(player, move.to.row, move.to.col)) return move;
  return { ...move, promotion: "q" };
}

function pawnMoves(board: FourBoard, row: number, col: number, player: FourPlayerId): FourMove[] {
  const { dr, dc } = playerDirection(player);
  const moves: FourMove[] = [];
  const forward = { row: row + dr, col: col + dc };
  const startRow = player === 0 ? 12 : player === 2 ? 1 : null;
  const startCol = player === 1 ? 1 : player === 3 ? 12 : null;

  if (isActiveSquare(forward.row, forward.col) && !pieceAt(board, forward.row, forward.col)) {
    moves.push(withPromotion({ from: { row, col }, to: forward }, player, "p"));
    const isStart =
      (startRow !== null && row === startRow) || (startCol !== null && col === startCol);
    const double = { row: row + dr * 2, col: col + dc * 2 };
    if (isStart && isActiveSquare(double.row, double.col) && !pieceAt(board, double.row, double.col)) {
      moves.push(withPromotion({ from: { row, col }, to: double }, player, "p"));
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
      moves.push(
        withPromotion(
          { from: { row, col }, to: { row: r, col: c }, capture: target },
          player,
          "p",
        ),
      );
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

function livingOpponents(board: FourBoard, player: FourPlayerId): FourPlayerId[] {
  return ([0, 1, 2, 3] as FourPlayerId[]).filter((p) => p !== player && findKing(board, p));
}

export function isSquareAttacked(
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

export function isInCheck(board: FourBoard, player: FourPlayerId): boolean {
  const king = findKing(board, player);
  if (!king) return false;
  return livingOpponents(board, player).some((p) =>
    isSquareAttacked(board, king.row, king.col, p),
  );
}

export function applyBoardMove(board: FourBoard, move: FourMove): FourBoard {
  const next = board.map((row) => [...row]);
  const piece = next[move.from.row][move.from.col];
  if (!piece) return next;
  next[move.from.row][move.from.col] = null;
  next[move.to.row][move.to.col] = move.promotion
    ? { ...piece, type: move.promotion }
    : { ...piece };
  return next;
}

export type FourPlayResult = {
  board: FourBoard;
  turn: FourPlayerId;
  eliminated: Set<FourPlayerId>;
  lastEliminated: FourPlayerId | null;
};

export function playMove(
  board: FourBoard,
  turn: FourPlayerId,
  eliminated: Set<FourPlayerId>,
  move: FourMove,
): FourPlayResult | null {
  let nextBoard = applyBoardMove(board, move);
  const piece = board[move.from.row][move.from.col];
  if (!piece) return null;

  const newEliminated = new Set(eliminated);
  let justEliminated: FourPlayerId | null = null;

  for (const p of [0, 1, 2, 3] as FourPlayerId[]) {
    if (newEliminated.has(p) || p === piece.player) continue;
    if (isKingCaptured(nextBoard, p) || isCheckmated(nextBoard, p)) {
      nextBoard = removePlayerPieces(nextBoard, p);
      newEliminated.add(p);
      justEliminated = p;
    }
  }

  let nextTurn = nextPlayer(turn, newEliminated);
  if (newEliminated.size < 3) {
    let guard = 0;
    while (
      !newEliminated.has(nextTurn) &&
      getLegalMoves(nextBoard, nextTurn).length === 0 &&
      guard < 4
    ) {
      nextTurn = nextPlayer(nextTurn, newEliminated);
      guard++;
    }
  }

  return {
    board: nextBoard,
    turn: nextTurn,
    eliminated: newEliminated,
    lastEliminated: justEliminated,
  };
}

export function getLegalMoves(board: FourBoard, player: FourPlayerId): FourMove[] {
  const kingPos = findKing(board, player);
  if (!kingPos) return [];

  const pseudo: FourMove[] = [];
  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[r].length; c++) {
      const piece = board[r][c];
      if (piece?.player === player) {
        pseudo.push(...pieceMoves(board, r, c, piece));
      }
    }
  }

  const legal: FourMove[] = [];
  for (const move of pseudo) {
    const next = applyBoardMove(board, move);
    const newKing = findKing(next, player);
    if (!newKing) continue;
    const attacked = livingOpponents(next, player).some((p) =>
      isSquareAttacked(next, newKing.row, newKing.col, p),
    );
    if (!attacked) legal.push(move);
  }
  return legal;
}

export function isCheckmated(board: FourBoard, player: FourPlayerId): boolean {
  if (!findKing(board, player)) return false;
  return isInCheck(board, player) && getLegalMoves(board, player).length === 0;
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

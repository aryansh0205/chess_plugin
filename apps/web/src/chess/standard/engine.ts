import { Chess, type Move } from "chess.js";

const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === "w" ? -99999 : 99999;
  }
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;
  const board = chess.board();
  for (const row of board) {
    for (const piece of row) {
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] ?? 0;
      score += piece.color === "w" ? value : -value;
    }
  }
  return score;
}

function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => {
    const aCap = a.captured ? (PIECE_VALUES[a.captured] ?? 0) : 0;
    const bCap = b.captured ? (PIECE_VALUES[b.captured] ?? 0) : 0;
    return bCap - aCap;
  });
}

function minimax(chess: Chess, depth: number, alpha: number, beta: number, maximizing: boolean): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const moves = orderMoves(chess.moves({ verbose: true }));

  if (maximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    chess.move(move);
    const evalScore = minimax(chess, depth - 1, alpha, beta, true);
    chess.undo();
    minEval = Math.min(minEval, evalScore);
    beta = Math.min(beta, evalScore);
    if (beta <= alpha) break;
  }
  return minEval;
}

export function getBestMove(chess: Chess, depth = 3): Move | null {
  const moves = orderMoves(chess.moves({ verbose: true }));
  if (moves.length === 0) return null;

  const maximizing = chess.turn() === "w";
  let bestMove = moves[0];
  let bestEval = maximizing ? -Infinity : Infinity;

  for (const move of moves) {
    chess.move(move);
    const evalScore = minimax(chess, depth - 1, -Infinity, Infinity, !maximizing);
    chess.undo();

    if (maximizing ? evalScore > bestEval : evalScore < bestEval) {
      bestEval = evalScore;
      bestMove = move;
    }
  }

  return bestMove;
}

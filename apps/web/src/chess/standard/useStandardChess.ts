import { useCallback, useEffect, useMemo, useState } from "react";
import { Chess, type Square as ChessSquare } from "chess.js";
import { getBestMove } from "./engine";
import { getStandardResult, type GameResult } from "../gameResult";
import type { StandardColor } from "../types";

export type StandardChessState = {
  chess: Chess;
  selected: ChessSquare | null;
  legalTargets: Set<ChessSquare>;
  lastMove: { from: ChessSquare; to: ChessSquare } | null;
  thinking: boolean;
  status: string;
  winner: StandardColor | null;
  isDraw: boolean;
};

export function useStandardChess(mode: "cpu" | "2p") {
  const [chess, setChess] = useState(() => new Chess());
  const [selected, setSelected] = useState<ChessSquare | null>(null);
  const [lastMove, setLastMove] = useState<{ from: ChessSquare; to: ChessSquare } | null>(null);
  const [thinking, setThinking] = useState(false);

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<ChessSquare>();
    return new Set(
      chess.moves({ square: selected, verbose: true }).map((m) => m.to as ChessSquare),
    );
  }, [chess, selected]);

  const status = useMemo(() => {
    if (chess.isCheckmate()) {
      const winner = chess.turn() === "w" ? "Black" : "White";
      return `Checkmate — ${winner} wins`;
    }
    if (chess.isStalemate()) return "Stalemate — draw";
    if (chess.isDraw()) return "Draw";
    if (chess.isCheck()) return `${chess.turn() === "w" ? "White" : "Black"} is in check`;
    if (mode === "cpu") {
      return chess.turn() === "w" ? "Your turn (White)" : "CPU thinking…";
    }
    return `${chess.turn() === "w" ? "White" : "Black"} to move`;
  }, [chess, mode]);

  const gameResult = useMemo((): GameResult => getStandardResult(chess), [chess]);

  const winner = useMemo((): StandardColor | null => {
    if (gameResult.kind !== "checkmate") return null;
    return gameResult.winner;
  }, [gameResult]);

  const reset = useCallback(() => {
    setChess(new Chess());
    setSelected(null);
    setLastMove(null);
    setThinking(false);
  }, []);

  const tryMove = useCallback(
    (from: ChessSquare, to: ChessSquare) => {
      const next = new Chess(chess.fen());
      const move = next.move({ from, to, promotion: "q" });
      if (!move) return false;
      setChess(next);
      setSelected(null);
      setLastMove({ from, to });
      return true;
    },
    [chess],
  );

  const onSquareClick = useCallback(
    (square: ChessSquare) => {
      if (thinking || chess.isGameOver()) return;

      const piece = chess.get(square);
      if (selected) {
        if (selected === square) {
          setSelected(null);
          return;
        }
        if (tryMove(selected, square)) return;
      }

      if (piece && piece.color === chess.turn()) {
        if (mode === "cpu" && piece.color === "b") return;
        setSelected(square);
      }
    },
    [chess, mode, selected, thinking, tryMove],
  );

  useEffect(() => {
    if (mode !== "cpu" || chess.isGameOver() || chess.turn() !== "b") return;

    setThinking(true);
    const timer = window.setTimeout(() => {
      const next = new Chess(chess.fen());
      const best = getBestMove(next, 3);
      if (best) {
        next.move(best);
        setChess(next);
        setLastMove({ from: best.from as ChessSquare, to: best.to as ChessSquare });
      }
      setThinking(false);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [chess, mode]);

  return {
    chess,
    selected,
    legalTargets,
    lastMove,
    thinking,
    status,
    gameResult,
    winner,
    isDraw: chess.isDraw() || chess.isStalemate(),
    onSquareClick,
    reset,
  };
}

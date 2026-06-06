import { useCallback, useMemo, useState } from "react";
import { createInitialBoard, type FourBoard } from "./board";
import {
  getLegalMoves,
  isKingCaptured,
  moveKey,
  nextPlayer,
  type FourMove,
} from "./moves";
import type { GameResult } from "../gameResult";
import type { FourPlayerId } from "../types";
import { FOUR_PLAYER_NAMES } from "../types";

export function useFourPlayerChess() {
  const [board, setBoard] = useState<FourBoard>(() => createInitialBoard());
  const [turn, setTurn] = useState<FourPlayerId>(0);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [lastMove, setLastMove] = useState<FourMove | null>(null);
  const [eliminated, setEliminated] = useState<Set<FourPlayerId>>(new Set());
  const [lastEliminated, setLastEliminated] = useState<FourPlayerId | null>(null);

  const legalMoves = useMemo(() => getLegalMoves(board, turn), [board, turn]);

  const legalTargets = useMemo(() => {
    if (!selected) return new Set<string>();
    const prefix = `${selected.row},${selected.col}-`;
    return new Set(
      legalMoves.filter((m) => moveKey(m).startsWith(prefix)).map((m) => `${m.to.row},${m.to.col}`),
    );
  }, [legalMoves, selected]);

  const activePlayers = useMemo(
    () => ([0, 1, 2, 3] as FourPlayerId[]).filter((p) => !eliminated.has(p)),
    [eliminated],
  );

  const winner = useMemo((): FourPlayerId | null => {
    if (activePlayers.length === 1) return activePlayers[0];
    return null;
  }, [activePlayers]);

  const gameResult = useMemo((): GameResult => {
    if (winner !== null) return { kind: "four_win", winner };
    if (lastEliminated !== null) return { kind: "four_eliminated", player: lastEliminated };
    return { kind: "playing" };
  }, [lastEliminated, winner]);

  const status = useMemo(() => {
    if (winner !== null) return `Checkmate — ${FOUR_PLAYER_NAMES[winner]} wins!`;
    if (legalMoves.length === 0) return `${FOUR_PLAYER_NAMES[turn]} has no legal moves — skipped`;
    return `${FOUR_PLAYER_NAMES[turn]} to move`;
  }, [legalMoves.length, turn, winner]);

  const reset = useCallback(() => {
    setBoard(createInitialBoard());
    setTurn(0);
    setSelected(null);
    setLastMove(null);
    setEliminated(new Set());
    setLastEliminated(null);
  }, []);

  const applyMove = useCallback(
    (move: FourMove) => {
      const nextBoard = board.map((row) => [...row]);
      const piece = nextBoard[move.from.row][move.from.col];
      if (!piece) return;

      nextBoard[move.from.row][move.from.col] = null;
      const promoted =
        piece.type === "p" &&
        ((piece.player === 0 && move.to.row <= 3) ||
          (piece.player === 2 && move.to.row >= 10) ||
          (piece.player === 1 && move.to.col >= 10) ||
          (piece.player === 3 && move.to.col <= 3));

      nextBoard[move.to.row][move.to.col] = promoted
        ? { ...piece, type: "q" }
        : { ...piece };

      const newEliminated = new Set(eliminated);
      let justEliminated: FourPlayerId | null = null;
      for (const p of [0, 1, 2, 3] as FourPlayerId[]) {
        if (!eliminated.has(p) && isKingCaptured(nextBoard, p)) {
          newEliminated.add(p);
          justEliminated = p;
        }
      }

      let nextTurn = nextPlayer(turn, newEliminated);
      if (newEliminated.size < 3) {
        let guard = 0;
        while (getLegalMoves(nextBoard, nextTurn).length === 0 && guard < 4) {
          nextTurn = nextPlayer(nextTurn, newEliminated);
          guard++;
        }
      }

      setBoard(nextBoard);
      setEliminated(newEliminated);
      setLastEliminated(justEliminated);
      setTurn(nextTurn);
      setSelected(null);
      setLastMove(move);

      if (newEliminated.size >= 3) {
        window.setTimeout(() => setLastEliminated(null), 1200);
      }
    },
    [board, eliminated, turn],
  );

  const onSquareClick = useCallback(
    (row: number, col: number) => {
      if (winner !== null) return;

      if (selected) {
        const move = legalMoves.find(
          (m) =>
            m.from.row === selected.row &&
            m.from.col === selected.col &&
            m.to.row === row &&
            m.to.col === col,
        );
        if (move) {
          applyMove(move);
          return;
        }
        if (selected.row === row && selected.col === col) {
          setSelected(null);
          return;
        }
      }

      const piece = board[row][col];
      if (piece?.player === turn) {
        setSelected({ row, col });
      }
    },
    [applyMove, board, legalMoves, selected, turn, winner],
  );

  return {
    board,
    turn,
    selected,
    legalTargets,
    lastMove,
    eliminated,
    status,
    gameResult,
    winner,
    onSquareClick,
    reset,
  };
}

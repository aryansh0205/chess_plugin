import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createInitialBoard,
  findKing,
  squareKey,
  type FourBoard,
} from "./board";
import { getBestFourMove } from "./engine";
import {
  getLegalMoves,
  isInCheck,
  moveKey,
  nextPlayer,
  playMove,
  type FourMove,
} from "./moves";
import type { FourPiece } from "./board";
import type { GameResult } from "../gameResult";
import type { FourPlayerId } from "../types";
import { FOUR_PLAYER_NAMES } from "../types";

export const HUMAN_PLAYER: FourPlayerId = 0;

export function useFourPlayerChess(vsCpu: boolean) {
  const [board, setBoard] = useState<FourBoard>(() => createInitialBoard());
  const [turn, setTurn] = useState<FourPlayerId>(0);
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [lastMove, setLastMove] = useState<FourMove | null>(null);
  const [eliminated, setEliminated] = useState<Set<FourPlayerId>>(new Set());
  const [lastEliminated, setLastEliminated] = useState<FourPlayerId | null>(null);
  const [thinking, setThinking] = useState(false);
  const [captured, setCaptured] = useState<FourPiece[]>([]);

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

  const checkedSquares = useMemo(() => {
    const keys = new Set<string>();
    for (const p of [0, 1, 2, 3] as FourPlayerId[]) {
      if (eliminated.has(p) || !isInCheck(board, p)) continue;
      const king = findKing(board, p);
      if (king) keys.add(squareKey(king.row, king.col));
    }
    return keys;
  }, [board, eliminated]);

  const gameResult = useMemo((): GameResult => {
    if (winner !== null) return { kind: "four_win", winner };
    if (lastEliminated !== null) return { kind: "four_eliminated", player: lastEliminated };
    return { kind: "playing" };
  }, [lastEliminated, winner]);

  const status = useMemo(() => {
    const name = FOUR_PLAYER_NAMES[turn];
    if (winner !== null) {
      if (vsCpu && winner === HUMAN_PLAYER) return "Checkmate — you win!";
      return `Checkmate — ${FOUR_PLAYER_NAMES[winner]} wins!`;
    }
    if (vsCpu && (thinking || turn !== HUMAN_PLAYER)) {
      return `${name} CPU thinking…`;
    }
    if (isInCheck(board, turn)) {
      return vsCpu && turn === HUMAN_PLAYER ? "Your king is in check" : `${name} is in check`;
    }
    if (vsCpu) return "Your turn (Yellow)";
    return `${name} to move`;
  }, [board, thinking, turn, vsCpu, winner]);

  const reset = useCallback(() => {
    setBoard(createInitialBoard());
    setTurn(0);
    setSelected(null);
    setLastMove(null);
    setEliminated(new Set());
    setLastEliminated(null);
    setThinking(false);
    setCaptured([]);
  }, []);

  const applyMove = useCallback(
    (move: FourMove) => {
      const result = playMove(board, turn, eliminated, move);
      if (!result) return;

      const newlyDead: FourPiece[] = [];
      if (move.capture) newlyDead.push({ ...move.capture });
      for (const p of result.eliminated) {
        if (eliminated.has(p)) continue;
        for (let r = 0; r < board.length; r++) {
          for (let c = 0; c < board[r].length; c++) {
            const cell = board[r][c];
            if (!cell || cell.player !== p) continue;
            if (move.capture && r === move.to.row && c === move.to.col) continue;
            newlyDead.push({ ...cell });
          }
        }
      }

      setBoard(result.board);
      setEliminated(result.eliminated);
      setLastEliminated(result.lastEliminated);
      setTurn(result.turn);
      setSelected(null);
      setLastMove(move);
      if (newlyDead.length > 0) setCaptured((prev) => [...prev, ...newlyDead]);

      if (result.eliminated.size >= 3) {
        window.setTimeout(() => setLastEliminated(null), 1200);
      }
    },
    [board, eliminated, turn],
  );

  const onSquareClick = useCallback(
    (row: number, col: number) => {
      if (winner !== null || thinking) return;
      if (vsCpu && turn !== HUMAN_PLAYER) return;

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
    [applyMove, board, legalMoves, selected, thinking, turn, vsCpu, winner],
  );

  useEffect(() => {
    if (!vsCpu) {
      setThinking(false);
      return;
    }
    if (winner !== null || turn === HUMAN_PLAYER || eliminated.has(turn)) return;

    setThinking(true);
    const timer = window.setTimeout(() => {
      const best = getBestFourMove(board, turn, eliminated);
      if (best) {
        applyMove(best);
      } else {
        setTurn(nextPlayer(turn, eliminated));
      }
      setThinking(false);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [applyMove, board, eliminated, turn, vsCpu, winner]);

  return {
    board,
    turn,
    selected,
    legalTargets,
    lastMove,
    eliminated,
    checkedSquares,
    thinking,
    captured,
    status,
    gameResult,
    winner,
    onSquareClick,
    reset,
  };
}

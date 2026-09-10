import type { Chess } from "chess.js";
import type { FourPlayerId, StandardColor } from "./types";
import { FOUR_PLAYER_NAMES } from "./types";

export type GameResult =
  | { kind: "playing" }
  | { kind: "check"; player: StandardColor }
  | { kind: "checkmate"; winner: StandardColor; loser: StandardColor }
  | { kind: "stalemate" }
  | { kind: "draw"; reason?: string }
  | { kind: "four_win"; winner: FourPlayerId }
  | { kind: "four_eliminated"; player: FourPlayerId };

export function getStandardResult(chess: Chess): GameResult {
  if (chess.isCheckmate()) {
    const loser = chess.turn();
    const winner = loser === "w" ? "b" : "w";
    return { kind: "checkmate", winner, loser };
  }
  if (chess.isStalemate()) return { kind: "stalemate" };
  if (chess.isDraw()) return { kind: "draw" };
  if (chess.isCheck()) return { kind: "check", player: chess.turn() };
  return { kind: "playing" };
}

export function resultAnnouncement(
  result: GameResult,
  mode: "cpu" | "2p" | "4p",
  vsCpu = true,
): string | null {
  switch (result.kind) {
    case "check": {
      const name = result.player === "w" ? "White" : "Black";
      if (mode === "cpu" && result.player === "w") return "Check! Watch your king.";
      if (mode === "cpu" && result.player === "b") return "Check!";
      return `Check! ${name} is in check.`;
    }
    case "checkmate": {
      if (mode === "cpu") {
        return result.winner === "w"
          ? "Checkmate! You win!"
          : "Checkmate! CPU wins. Better luck next time.";
      }
      const winner = result.winner === "w" ? "White" : "Black";
      return `Checkmate! ${winner} wins the game.`;
    }
    case "stalemate":
      return "Stalemate. The game is a draw.";
    case "draw":
      return "Draw. The game ends in a tie.";
    case "four_win":
      return vsCpu && result.winner === 0
        ? "Checkmate! You win!"
        : `Checkmate! ${FOUR_PLAYER_NAMES[result.winner]} wins the game.`;
    case "four_eliminated":
      return `${FOUR_PLAYER_NAMES[result.player]} has been eliminated.`;
    case "playing":
      return null;
  }
}

export function resultTitle(
  result: GameResult,
  mode: "cpu" | "2p" | "4p",
  vsCpu = true,
): string | null {
  switch (result.kind) {
    case "checkmate":
      if (mode === "cpu") return result.winner === "w" ? "You Win!" : "CPU Wins";
      return `${result.winner === "w" ? "White" : "Black"} Wins`;
    case "stalemate":
      return "Stalemate";
    case "draw":
      return "Draw";
    case "four_win":
      return vsCpu && result.winner === 0
        ? "You Win!"
        : `${FOUR_PLAYER_NAMES[result.winner]} Wins`;
    default:
      return null;
  }
}

export function resultSubtitle(
  result: GameResult,
  mode: "cpu" | "2p" | "4p",
  vsCpu = true,
): string | null {
  switch (result.kind) {
    case "checkmate":
      return mode === "cpu"
        ? result.winner === "w"
          ? "Checkmate — brilliant play."
          : "Checkmate — the CPU outplayed you."
        : `Checkmate — ${result.loser === "w" ? "White" : "Black"} has no escape.`;
    case "stalemate":
      return "No legal moves remain, but the king is not in check.";
    case "draw":
      return result.reason ?? "The game ends in a tie.";
    case "four_win":
      return vsCpu && result.winner === 0
        ? "Last king standing — well played."
        : vsCpu
          ? "The last king standing belongs to the CPU."
          : "Last king standing claims victory.";
    default:
      return null;
  }
}

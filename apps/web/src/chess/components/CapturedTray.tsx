import { PieceGlyph } from "./PieceGlyph";
import type { PieceType } from "../types";

export type DeadPiece = {
  type: PieceType;
  color: string;
  outlined?: boolean;
  isLight?: boolean;
};

type Group = {
  id: string;
  label: string;
  accent: string;
  pieces: DeadPiece[];
};

type Props = {
  groups: Group[];
};

export function CapturedTray({ groups }: Props) {
  const total = groups.reduce((n, g) => n + g.pieces.length, 0);

  return (
    <div className="w-full max-w-[44rem] rounded-xl border border-border bg-surface/80 px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fg-muted">
          Captured
        </p>
        <p className="text-[11px] text-fg-muted">
          {total === 0 ? "None yet" : `${total} off the board`}
        </p>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {groups.map((group) => (
          <div
            key={group.id}
            className="min-h-[3.25rem] rounded-lg border border-border/80 bg-page/70 px-2.5 py-2"
            style={{ boxShadow: `inset 3px 0 0 ${group.accent}` }}
          >
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-muted">
              {group.label}
            </p>
            {group.pieces.length === 0 ? (
              <p className="text-[11px] text-fg-muted/60">Empty</p>
            ) : (
              <div className="flex flex-wrap items-center gap-0.5">
                {group.pieces.map((piece, i) => (
                  <span
                    key={`${group.id}-${piece.type}-${i}`}
                    className="chess-grave-piece flex h-7 w-7 items-center justify-center"
                    style={{ animationDelay: `${Math.min(i, 8) * 30}ms` }}
                  >
                    <PieceGlyph
                      type={piece.type}
                      color={piece.color}
                      outlined={piece.outlined}
                      isLight={piece.isLight}
                      size="sm"
                    />
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
